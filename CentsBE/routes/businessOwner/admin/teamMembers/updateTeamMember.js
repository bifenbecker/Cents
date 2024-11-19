const { transaction } = require('objection');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const TeamMember = require('../../../../models/teamMember');
const User = require('../../../../models/user');
const Role = require('../../../../models/role');
const UserRole = require('../../../../models/userRoles');
const TeamMemberStore = require('../../../../models/teamMemberStore');
const Store = require('../../../../models/store');
const TeamMemberCheckIn = require('../../../../models/teamMemberCheckIn');
const getBusiness = require('../../../../utils/getBusiness');
const phoneNumberValidations = require('../../../../validations/signUpValidations/phoneNumber');
const emailValidation = require('../../../../validations/signUpValidations/email');
const eventEmitter = require('../../../../config/eventEmitter');
const { emailNotificationEvents, userRoles } = require('../../../../constants/constants');
const LoggerHandler = require('../../../../LoggerHandler/LoggerHandler');

async function addResetPasswordToken(user, transaction) {
    try {
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET_TOKEN);
        const updatedUser = await User.query(transaction)
            .patch({
                resetPasswordToken: token,
            })
            .findById(user.id)
            .returning('*');
        return updatedUser;
    } catch (error) {
        throw new Error(error);
    }
}

function teamMemberAndStoreMapping(teamMemberId, assignedLocations) {
    const teamMemberStore = assignedLocations.map((storeId) => {
        const mappedTeamMember = {
            storeId,
            teamMemberId,
        };
        return mappedTeamMember;
    });
    return teamMemberStore;
}

/**
 * Determine if the employee code belongs to a different employee in the business
 *
 * @param {Number} teamMemberId
 * @param {Number} businessId
 * @param {Number} employeeCode
 */
async function findTeamMemberByEmployeeCode(teamMemberId, businessId, employeeCode) {
    const teamMember = await TeamMember.query().whereNot('id', teamMemberId).findOne({
        businessId,
        employeeCode,
    });

    return teamMember;
}

module.exports = exports = async function updateTeamMember(req, res, next) {
    const userFields = ['phone', 'fullName', 'email', 'isManager', 'adminAccess'];
    const teamMemberFields = ['birthday', 'employeeCode', 'role'];
    const storeFields = ['assignedLocations'];
    let trx = null;
    let errMsg;

    try {
        const currentTeamMember = await TeamMember.query()
            .select('userId', 'id', 'employeeCode')
            .findById(req.body.id);
        const business = await getBusiness(req);
        const userId = _.get(currentTeamMember, 'userId', null);
        const teamMemberId = req.body.id;
        if (!teamMemberId) {
            errMsg = 'Bad Request, team member not found';
            LoggerHandler('error', errMsg, req);
            return res.status(400).json({
                error: errMsg,
            });
        }
        if (!userId || !req.body.field || _.isNil(req.body.value)) {
            errMsg = 'Bad Request; id, field and value are required';
            LoggerHandler('error', errMsg, req);
            return res.status(400).json({
                error: errMsg,
            });
        }
        if (userFields.includes(req.body.field)) {
            if (req.body.field === 'fullName') {
                req.body.value = req.body.value.replace(/ +(?= )/g, '');
                const nameSplit = req.body.value.split(' ');
                const firstname = nameSplit[0];
                const lastname = nameSplit[1];
                await User.query()
                    .patch({
                        firstname: firstname || '',
                        lastname: lastname || '',
                    })
                    .findById(userId);
            } else if (req.body.field === 'isManager') {
                if (
                    !(
                        req.currentUser.role === 'Business Owner' ||
                        req.currentUser.role === 'Business Admin'
                    )
                ) {
                    return res.status(403).json({
                        error: 'Only Business owner and Admin can change the role.',
                    });
                }
                let role;
                const customerRole = await Role.query().findOne('userType', 'Customer');
                if (req.body.value === false) {
                    role = await Role.query().where('roles.userType', '=', 'Employee').first();
                } else {
                    role = await Role.query()
                        .where('roles.userType', '=', 'Business Manager')
                        .first();
                }
                trx = await transaction.start(User.knex());
                if (req.body.value === true) {
                    const user = await User.query(trx).findById(userId);
                    const updatedUser = await addResetPasswordToken(user, trx);
                    eventEmitter.emit(
                        'emailNotification',
                        emailNotificationEvents.MANAGER_ACCESS_PASSWORD_RESET,
                        {
                            updatedUser,
                            currentUser: req.currentUser,
                        },
                    );
                }
                await UserRole.query(trx)
                    .patch({
                        roleId: role.id,
                    })
                    .where('userId', userId)
                    .andWhere('roleId', '<>', customerRole.id)
                    .returning('*');
                await trx.commit();
            } else if (req.body.field === 'adminAccess') {
                let role;
                const customerRole = await Role.query().findOne('userType', 'Customer');
                if (req.body.value === false) {
                    role = await Role.query()
                        .select('roles.id')
                        .where('roles.userType', '=', 'Business Manager')
                        .first();
                } else {
                    role = await Role.query()
                        .select('roles.id')
                        .where('roles.userType', '=', 'Business Admin')
                        .first();
                    const user = await User.query(trx).findById(userId);
                    const updatedUser = await addResetPasswordToken(user, trx);
                    eventEmitter.emit(
                        'emailNotification',
                        emailNotificationEvents.ADMIN_ACCESS_PASSWORD_RESET,
                        {
                            updatedUser,
                            currentUser: req.currentUser,
                        },
                    );
                }
                await UserRole.query()
                    .patch({
                        roleId: role.id,
                    })
                    .where('userId', userId)
                    .andWhere('roleId', '<>', customerRole.id);
            } else {
                if (req.body.field === 'phone') {
                    const isPhoneNumberInvalid = await phoneNumberValidations(
                        req.body.value,
                        userId,
                    );
                    if (isPhoneNumberInvalid) {
                        return res.status(422).json({
                            error: 'Phone number already exists. Please enter a valid phone number.',
                        });
                    }
                }
                if (req.body.field === 'email') {
                    const emailExists = await emailValidation(
                        req.body.value.toUpperCase(),
                        'Customer',
                        'Employee',
                        userId,
                    );
                    if (emailExists.error) {
                        errMsg = emailExists.message;
                        LoggerHandler('error', errMsg, req);
                        return res.status(422).json({
                            error: errMsg,
                        });
                    }
                }
                await User.query()
                    .patch({
                        [req.body.field]: req.body.value,
                    })
                    .findById(userId);
            }
        } else if (teamMemberFields.includes(req.body.field)) {
            if (req.body.field === 'employeeCode') {
                const teamMemberEmployeeCode = await findTeamMemberByEmployeeCode(
                    req.body.id,
                    business.id,
                    req.body.value,
                );
                const isEmployeeCheckedIn = await TeamMemberCheckIn.query(trx).where({
                    teamMemberId,
                    checkOutTime: null,
                });
                if (teamMemberEmployeeCode) {
                    return res.status(422).json({
                        error: 'This employee code already exists. Please choose a different one.',
                    });
                }
                if (
                    isEmployeeCheckedIn.length > 0 &&
                    currentTeamMember.employeeCode !== req.body.value
                ) {
                    return res.status(422).json({
                        error: 'This employee is currently checked in somewhere. To change the employee code, the employee needs to check out first.',
                    });
                }
            }
            await TeamMember.query()
                .patch({
                    [req.body.field]: req.body.value,
                })
                .where('userId', '=', userId);
        } else if (storeFields.includes(req.body.field)) {
            trx = await transaction.start(TeamMemberStore.knex());
            let currentLocations = await TeamMemberStore.query(trx)
                .select('storeId')
                .where('teamMemberId', '=', teamMemberId);
            currentLocations = currentLocations.map((location) => location.storeId);
            const locDifference = currentLocations.filter(
                (storeId) => !req.body.value.includes(storeId),
            );
            if (locDifference.length) {
                const currentLoggedIn = await TeamMemberCheckIn.query(trx)
                    .whereIn('storeId', locDifference)
                    .where({
                        teamMemberId,
                        checkOutTime: null,
                    });
                if (currentLoggedIn.length) {
                    const storeName = await Store.query(trx)
                        .select('name')
                        .findById(currentLoggedIn[0].storeId);
                    return res.status(422).json({
                        error: `Currently checked in at ${storeName.name}. Please check the member out using Time Card tab or Employee Tablet App.`,
                    });
                }
            }
            await TeamMemberStore.query(trx).delete().where('teamMemberId', '=', teamMemberId);
            const teamMember = teamMemberAndStoreMapping(teamMemberId, req.body.value);
            await TeamMemberStore.query(trx).insert(teamMember);
            await trx.commit();
        } else {
            errMsg = 'Invalid field name';
            LoggerHandler('error', errMsg, req);
            return res.status(400).json({
                error: errMsg,
            });
        }
        const details = await TeamMember.knex().raw(`
        SELECT 
            u."id" as "userId",
            "teamMembers".id,
            trim(CONCAT (u."firstname",' ',u."lastname")) as "fullName",
            u.email, COALESCE(u."phone", '') as "phone","teamMembers"."employeeCode",
            CASE roles."userType"
                WHEN 'Business Manager' THEN true
                WHEN 'Business Admin' THEN true
                ELSE false
            END as "isManager",
            CASE roles."userType"
                WHEN 'Business Admin' THEN true
                ELSE false
            END as "adminAccess",
            roles."userType" as "userType",
            (
                SELECT COALESCE(ARRAY_AGG( stores.name), '{}') as "checkedInLocation" from users 
                join "teamMembers" on "users".id = "teamMembers"."userId"
                join "teamMembersCheckIn" on "teamMembers"."id" = "teamMembersCheckIn"."teamMemberId"
                join "stores" on "teamMembersCheckIn"."storeId" = "stores"."id"
                where "teamMembers"."userId" = u."id"
                and "teamMembersCheckIn"."isCheckedIn"=TRUE
                and "teamMembersCheckIn"."checkOutTime" is null
             ),
             COALESCE("teamMembers"."birthday", '') as "birthday", COALESCE("teamMembers"."role", '') as "role",
            (
                SELECT COALESCE(ARRAY_AGG(DISTINCT stores.id), '{}') as "assignedLocations" from users 
                join "teamMembers" on "users".id = "teamMembers"."userId"
                join "teamMemberStores" on "teamMembers"."id" = "teamMemberStores"."teamMemberId"
                join "stores" on "teamMemberStores"."storeId" = "stores"."id"
                where "teamMembers"."userId" = u."id"
            )
            from roles join "userRoles" on roles.id = "userRoles"."roleId"
            join users u on "userRoles"."userId" = u."id"
            join "teamMembers" on u."id" = "teamMembers"."userId"
            where "teamMembers"."businessId" = ${business.id} and "teamMembers".id = ${teamMemberId} and roles."userType" <> 'Customer'
            group by u."id", "teamMembers"."id", roles."userType", "userRoles"."userId"
        `);
        details.rows[0].roleName = userRoles[details.rows[0].userType] || null;
        delete details.rows[0].userType;
        return res.status(200).json({
            success: true,
            details: details.rows[0],
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
};

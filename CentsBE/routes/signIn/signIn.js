const { raw } = require('objection');
const argon2 = require('argon2');

const userModel = require('../../models/user');
const Role = require('../../models/role');
const { USER_TYPES } = require('../../constants/constants');

const validator = require('../../validations/signIn');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const generateIntercomHash = require('../../utils/generateIntercomHash');
const generateUserAuthToken = require('../../utils/generateUserAuthToken');

async function signInUser(req, res, next) {
    try {
        const errorCheck = validator(req.body);

        if (!errorCheck.error) {
            const user = await userModel
                .query()
                .leftJoinRelated('teamMember.business')
                .select(
                    'users.id',
                    'users.firstname',
                    'users.lastname',
                    'users.email',
                    'users.password',
                    'users.isGlobalVerified',
                    'users.uuid',
                    'teamMember.id as teamMemberId',
                    'teamMember:business.id as businessId',
                    'teamMember:business.uuid as businessUuid',
                    'teamMember:business.name as businessName',
                    'teamMember.isDeleted as isTeamMemberDeleted',
                )
                .where(raw('lower(email)'), req.body.username.toLowerCase())
                .first();
            if (user && !user.isTeamMemberDeleted) {
                const verifyPassword = await argon2.verify(user.password, req.body.password);

                if (verifyPassword) {
                    const userRoles = await Role.query()
                        .select('roles.id as roleId', 'roles.userType')
                        .innerJoin('userRoles', 'roles.id', 'userRoles.roleId')
                        .innerJoin('users', 'users.id', 'userRoles.userId')
                        .where('users.id', user.id)
                        .andWhere('roles.userType', '<>', USER_TYPES.CUSTOMER)
                        .andWhere('roles.userType', '<>', USER_TYPES.EMPLOYEE)
                        .groupBy('roles.id', 'roles.userType');

                    if (userRoles.length) {
                        const role = userRoles[0];
                        const token = generateUserAuthToken(user, role);
                        const intercomHash = generateIntercomHash(user.uuid);

                        return res.json({
                            success: true,
                            user: {
                                token,
                                intercomHash,
                                userId: user.id,
                                roleId: role.roleId,
                                firstName: user.firstname,
                                lastName: user.lastname,
                                email: user.email,
                                isGlobalVerified: user.isGlobalVerified,
                                uuid: user.uuid,
                                teamMemberId: user.teamMemberId,
                                roleName: role.roleName(),
                            },
                            business: {
                                id: user.businessId,
                                name: user.businessName,
                                uuid: user.businessUuid,
                            },
                        });
                    }
                }

                return res.status(403).json({
                    error: 'Invalid credentials.',
                });
            }

            return res.status(403).json({
                error: 'The user matching the provided email and password does not exist.',
            });
        }

        const errMsg = errorCheck.error.message.split('[')[1].split(']')[0];

        LoggerHandler('error', errMsg, req);

        return res.status(422).json({
            error: errMsg,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = signInUser;

const { transaction } = require('objection');
const argon2 = require('argon2');

const Role = require('../../../../models/role');
const User = require('../../../../models/user');
const UserRole = require('../../../../models/userRoles');
const TeamMember = require('../../../../models/teamMember');

const { passwordGenerator } = require('../../../../utils/passwordGenerator');
const getBusiness = require('../../../../utils/getBusiness');

function createUserObj(req, password) {
    return {
        firstname: req.body.firstName,
        lastname: req.body.lastName,
        email: req.body.email,
        password,
    };
}

async function getDetails(userId) {
    try {
        const details = await User.knex().raw(`
        SELECT 
            "teamMembers"."id",
            CONCAT (u."firstname",' ',u."lastname") as "name",
            u.email, u."phone","teamMembers"."employeeCode",
             "teamMembers"."birthday", "teamMembers"."role",
            (
                SELECT json_agg(json_build_object(
                    'id', stores."id",
                    'name', stores."name"
                )) as "locations" from users 
                join "teamMembers" on "users".id = "teamMembers"."userId"
                join "teamMemberStores" on "teamMembers"."id" = "teamMemberStores"."teamMemberId"
                join "stores" on "teamMemberStores"."storeId" = "stores"."id"
                where "teamMembers"."userId" = u."id"
            )
            from users u join "teamMembers" on u."id" = "teamMembers"."userId"
            where "teamMembers"."userId" = ${userId}
        `);
        return details.rows[0];
    } catch (error) {
        throw new Error(error);
    }
}

async function addTeamMember(req, res, next) {
    let trx = null;
    try {
        const business = await getBusiness(req);
        if (!business) {
            res.status(404).json({
                error: 'Please add business details first.',
            });
            return;
        }
        const role = await Role.query().findOne({
            userType: 'Employee',
        });
        let userId;
        if (role) {
            const { isNew } = req;
            trx = await transaction.start(User.knex());
            /* if user is new. */
            if (isNew) {
                const password = await argon2.hash(passwordGenerator());
                const user = await User.query(trx)
                    .insert({
                        ...createUserObj(req, password),
                    })
                    .returning('*');
                userId = user.id;
                await UserRole.query(trx).insert({
                    userId,
                    roleId: role.id,
                });
            } else {
                userId = req.userId;
                await UserRole.query(trx).insert({
                    userId,
                    roleId: role.id,
                });
            }
            await TeamMember.query(trx).insert({
                userId,
                employeeCode: req.body.employeeCode,
                businessId: business.id,
            });
            await trx.commit();
            const details = await getDetails(userId);
            res.status(200).json({
                success: true,
                details,
            });
        } else {
            res.status(404).json({
                error: 'Role not found',
            });
        }
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = addTeamMember;

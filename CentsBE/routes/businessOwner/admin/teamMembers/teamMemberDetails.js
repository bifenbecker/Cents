const Joi = require('@hapi/joi');
const TeamMember = require('../../../../models/teamMember');
const getBusiness = require('../../../../utils/getBusiness');
const { userRoles } = require('../../../../constants/constants');

function validateParams(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.number().integer().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function teamMemberDetails(req, res, next) {
    try {
        const { id } = req.params;
        const validate = validateParams({ id });
        if (validate.error) {
            res.status(422).json({
                error: validate.error.message,
            });
            return;
        }

        const business = await getBusiness(req);
        const details = await TeamMember.knex().raw(`
        SELECT 
            u."id" as "userId",
            "teamMembers".id,
            CONCAT (u."firstname",' ',u."lastname") as "fullName",
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
            where "teamMembers"."businessId" = ${business.id} and "teamMembers".id = ${id} and roles."userType" <> 'Customer'
            group by u."id", "teamMembers"."id", roles."userType", "userRoles"."userId"
        `);
        details.rows[0].roleName = userRoles[details.rows[0].userType] || null;
        delete details.rows[0].userType;
        res.status(200).json({
            success: true,
            details: details.rows[0],
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = teamMemberDetails;

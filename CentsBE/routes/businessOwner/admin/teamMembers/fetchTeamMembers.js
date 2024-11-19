const User = require('../../../../models/user');
const getBusiness = require('../../../../utils/getBusiness');

async function getTeamMembers(req, res, next) {
    try {
        const business = await getBusiness(req);
        const details = await User.knex().raw(`
        SELECT 
            u."id" as "userId",
            "teamMembers"."id",
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
             COALESCE("teamMembers"."birthday", '') as "birthday", COALESCE("teamMembers"."role", '') as "role",
             
             (
                SELECT COALESCE(ARRAY_AGG( stores.name), '{}') as "checkedInLocation" from users 
                join "teamMembers" on "users".id = "teamMembers"."userId"
                join "teamMembersCheckIn" on "teamMembers"."id" = "teamMembersCheckIn"."teamMemberId"
                join "stores" on "teamMembersCheckIn"."storeId" = "stores"."id"
                where "teamMembers"."userId" = u."id"
                and "teamMembersCheckIn"."isCheckedIn"=TRUE
                and "teamMembersCheckIn"."checkOutTime" is null
             ),
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
            where "teamMembers"."businessId" = ${business.id} and roles."userType" <> 'Customer'
            group by u."id", "teamMembers"."id", roles."userType", "userRoles"."userId"
            order by "fullName"
        `);

        res.status(200).json({
            success: true,
            teamMembers: details.rows,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getTeamMembers;

const TeamMember = require('../models/teamMember');
const validateEmployeeCode = require('./validateEmployeeCode');

const validateTeamMember = async (employeeCode, businessId, storeId) => {
    const { rows: teamMember } = await TeamMember.query().knex().raw(`
            SELECT "teamMembers".*,
            "teamMembersCheckIn"."isCheckedIn", "teamMemberStores"."storeId", "teamMemberStores"."teamMemberId" from "teamMembers"
            JOIN "teamMembersCheckIn" ON "teamMembers".id= "teamMembersCheckIn"."teamMemberId"
            LEFT JOIN "teamMemberStores" ON "teamMembers".id = "teamMemberStores"."teamMemberId" and "teamMemberStores"."storeId" = ${
                storeId || null
            }
            WHERE
            "teamMembers"."employeeCode"='${employeeCode}'
            and "teamMembers"."businessId"=${businessId} 
            ORDER BY "teamMembersCheckIn".id DESC
            `);
    // teammember not found error
    await validateEmployeeCode(employeeCode, businessId, storeId);
    // not checked in error
    if (teamMember.length && !teamMember[0].isCheckedIn) {
        throw new Error('Please check-in to continue.');
    }
    // because top most will have isCheckedIn true
    // [we are ordering by teamMemberCheckIn id desc]
    if (teamMember && teamMember[0].isCheckedIn) {
        return {
            ...teamMember[0],
        };
    }
    return {
        error: 'Error at validateTeamMember',
    };
};

module.exports = validateTeamMember;

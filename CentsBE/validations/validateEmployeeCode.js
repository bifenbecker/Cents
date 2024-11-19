const TeamMember = require('../models/teamMember');
const TeamMemberStore = require('../models/teamMemberStore');

async function validateEmployeeCode(employeeCode, businessId, storeId) {
    if (!employeeCode) {
        throw new Error('Employee Code is required.');
    }
    const teamMember = await TeamMember.query().findOne({
        employeeCode,
        businessId,
    });
    if (!teamMember) {
        throw new Error('Invalid employee code');
    }
    const teamMemberStore = await TeamMemberStore.query().findOne({
        teamMemberId: teamMember.id,
        storeId,
    });

    if (!teamMemberStore) {
        const user = await teamMember.getUser();
        const roles = await user.getRoles();
        if (roles && roles[0].roleName() !== 'owner') {
            throw new Error('You are not authorized to check-in in at this store.');
        }
    }
}

module.exports = validateEmployeeCode;

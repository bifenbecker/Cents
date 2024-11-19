const TeamMember = require('../models/teamMember');

async function employeeDetailsQuery(employeeCode, businessId) {
    const employee = await TeamMember.query()
        .select('teamMembers.id', 'users.firstname', 'users.lastname')
        .join('users', 'teamMembers.userId', 'users.id')
        .where('teamMembers.employeeCode', employeeCode)
        .andWhere('teamMembers.businessId', businessId);
    return employee;
}

module.exports = exports = employeeDetailsQuery;

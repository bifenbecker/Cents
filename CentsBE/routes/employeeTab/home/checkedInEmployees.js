const { raw } = require('objection');

const User = require('../../../models/user');

async function getUsers(req, res, next) {
    try {
        const { id } = req.currentStore;
        const users = await User.query()
            .select(
                raw('users.firstname || \' \'|| users.lastname as "fullName"'),
                'teamMembersCheckIn.id as checkInId',
                'teamMembers.employeeCode as employeeCode',
            )
            .join('teamMembers', 'teamMembers.userId', 'users.id')
            .join('teamMembersCheckIn', 'teamMembersCheckIn.teamMemberId', 'teamMembers.id')
            .where('teamMembersCheckIn.storeId', id)
            .andWhere('teamMembersCheckIn.isCheckedIn', true)
            .groupBy('users.id', 'teamMembersCheckIn.id', 'teamMembers.employeeCode')
            .orderBy('teamMembersCheckIn.checkInTime');
        res.status(200).json({
            success: true,
            employees: users,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getUsers;

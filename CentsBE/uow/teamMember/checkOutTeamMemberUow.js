const TeamMembersCheckIn = require('../../models/teamMemberCheckIn');

const checkOutTeamMemberUow = async (payload) => {
    const { transaction, teamMemberId, checkOutTime } = payload;

    const teamMemberCheckIn = await TeamMembersCheckIn.query(transaction)
        .findOne({
            teamMemberId,
            isCheckedIn: true,
        })
        .patch({
            checkOutTime,
            isCheckedIn: false,
        })
        .returning('*');

    payload.teamMemberCheckIn = teamMemberCheckIn;
    return payload;
};

module.exports = exports = checkOutTeamMemberUow;

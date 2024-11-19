const { raw } = require('objection');
const Users = require('../../models/user');

async function getTeamMemberName(payload) {
    const newPayload = payload;
    const { teamMemberId } = newPayload;
    try {
        const fullname = await Users.query()
            .select(raw('users.firstname || \' \'|| users.lastname as "fullName"'))
            .join('teamMembers', 'teamMembers.userId', '=', 'users.id')
            .join('teamMembersCheckIn', 'teamMembersCheckIn.teamMemberId', '=', 'teamMembers.id')
            .findOne('teamMembersCheckIn.teamMemberId', teamMemberId);
        newPayload.fullname = fullname.fullName;
        return newPayload;
    } catch (e) {
        throw new Error(e.message);
    }
}

module.exports = exports = getTeamMemberName;

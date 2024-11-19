// Models
const TeamMemberStore = require('../../../models/teamMemberStore');

/**
 * Get a list of all team members for an individual store
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 * @returns {Object}
 */
async function getTeamMembersForStore(req, res, next) {
    try {
        const { currentStore } = req;

        const teamMembers = await TeamMemberStore.query()
            .withGraphFetched('teamMember.[user]')
            .where({ storeId: currentStore.id });

        const formattedTeamMembers = teamMembers.map((member) => ({
            id: member.teamMember.id,
            fullName: `${member.teamMember.user.firstname} ${member.teamMember.user.lastname}`,
        }));

        return res.json({
            success: true,
            teamMembers: formattedTeamMembers,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = { getTeamMembersForStore };

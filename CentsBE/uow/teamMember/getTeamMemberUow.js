const TeamMember = require('../../models/teamMember');

/**
 * Use employeeCode to find the corresponding TeamMember
 *
 * @param {Object} payload
 */
async function getTeamMember(payload) {
    try {
        const newPayload = payload;
        const { employeeCode, store, transaction } = newPayload;

        const teamMember = await TeamMember.query(transaction)
            .withGraphFetched('user')
            .where({
                employeeCode,
                businessId: store.businessId,
            })
            .first();

        newPayload.teamMember = teamMember;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getTeamMember;

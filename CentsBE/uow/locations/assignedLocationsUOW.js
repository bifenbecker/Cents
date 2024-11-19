const TeamMemberStores = require('../../models/teamMemberStore');

const mappedResponse = (teamMemberStores) => {
    const response = {};
    response.totalAssignedLocations = teamMemberStores.length;
    if (teamMemberStores.length) {
        response.assignedLocations = teamMemberStores.map((teamMemberStore) => ({
            id: teamMemberStore.store.id,
            name: teamMemberStore.store.name,
            city: teamMemberStore.store.city,
            address: teamMemberStore.store.address,
            type: teamMemberStore.store.type,
            totalRecords: teamMemberStores.length,
        }));
    } else {
        response.assignedLocations = [];
    }
    response.needsRegions = teamMemberStores.length
        ? teamMemberStores[0].store.laundromatBusiness.needsRegions
        : false;
    return response;
};
/**
 * assigned locations UOW to fetch the locations associated with the current BO.
 *
 * @param {*} payload
 * @return {*} locations
 */
async function getAssignedLocations(payload) {
    try {
        const { businessId, teamMemberId } = payload;
        const teamMemberStores = await TeamMemberStores.query()
            .withGraphJoined('[store.laundromatBusiness]')
            .where('teamMemberStores.teamMemberId', teamMemberId)
            .andWhere('store.businessId', businessId);
        return mappedResponse(teamMemberStores);
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = getAssignedLocations;

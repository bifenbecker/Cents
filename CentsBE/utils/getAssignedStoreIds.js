const TeamMember = require('../models/teamMember');
const Stores = require('../models/store');
/**
 * 1) BO -> Without team member -> Get stores of the business.
 * 2) BO -> with team member -> Get assigned stores(Pre-requisite
 *  All the stores should be assigned)
 *  3) Rest of the roles -> with team memberID
 * - If there is no team member, then the user must and should be BO.
 * @param {*} [teamMemberId=null]
 * @param {*} role
 * @param {*} businessId
 * @return {*}
 */
module.exports = exports = async function assignedStores(teamMemberId = null, role, businessId) {
    let storeIds = [];
    if ((role === 'Business Admin' || role === 'Business Manager') && !teamMemberId) {
        throw new Error('team member id required');
    }
    if (role === 'Business Owner') {
        storeIds = await Stores.query().select('id as storeId').where('businessId', businessId);
    } else if (teamMemberId) {
        storeIds = await TeamMember.query()
            .select('teamMemberStores.storeId')
            .leftJoin('teamMemberStores', 'teamMemberStores.teamMemberId', 'teamMembers.id')
            .whereNot('teamMemberStores.storeId', null)
            .where('teamMembers.id', teamMemberId);
    }
    storeIds = storeIds.map((store) => store.storeId);
    return storeIds;
};

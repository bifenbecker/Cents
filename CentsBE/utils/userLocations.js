const Business = require('../models/laundromatBusiness');
const TeamMember = require('../models/teamMember');

async function userLocations(user) {
    const userRoles = await user.getRoles();
    // Get the role of the user other than customer.

    const mainRole = userRoles.filter((role) => role.userType !== 'Customer');

    // if user has roles other than customer.
    if (mainRole.length) {
        if (mainRole[0].userType === 'Business Owner') {
            // Find the particular business and all the stores related to that business.
            const { stores } = await Business.query()
                .findOne({
                    userId: user.id,
                })
                .withGraphJoined('stores');
            // Return an array of all the locations associated with the user,
            return stores.map((store) => store.id);
        }
        // Find all the stores related to that particular user.

        const teamMemberDetails = await TeamMember.query()
            .findOne({
                userId: user.id,
            })
            .withGraphJoined('stores');

        // if the particular teamMember is associated with the stores. -> return true.
        if (teamMemberDetails && teamMemberDetails.stores) {
            const { stores } = teamMemberDetails;
            // Return all the locations associated with that user.
            return stores.map((store) => store.id);
        }
    }
    return [];
}

module.exports = exports = userLocations;

const TeamMembersCheckIn = require('../../../../models/teamMemberCheckIn');
const Store = require('../../../../models/store');

async function isEmployeeCheckedIn(teamMemberId, storeId) {
    try {
        /**
         * checked in at same store. If yes then send valid true, isCheckedIn true, storeId,
         * sameStoreCheckOut true and return. checked in at different store. error and return.
         * not checked in. return valid true, isCheckedIn false, sameStoreCheckout false, storeId.
         */
        const response = {};
        // if you check out of a location
        const isCheckedIn = await TeamMembersCheckIn.query().findOne({
            teamMemberId,
            isCheckedIn: true,
        });
        if (isCheckedIn) {
            if (isCheckedIn.storeId === storeId) {
                response.valid = true;
                response.isCheckedIn = true;
                response.storeId = storeId;
                response.sameStoreCheckOut = true;
            } else if (isCheckedIn.storeId !== storeId) {
                const StoreAddress = await Store.query().where('id', isCheckedIn.storeId);
                response.storeId = storeId;
                response.sameStoreCheckOut = false;
                response.error = true;
                response.message = `You are already checked in at another store. Please check out from the last
                     store where you had checked-in`;
                response.address = StoreAddress[0].name;
            }
        } else {
            response.valid = true;
            response.isCheckedIn = false;
            response.sameStoreCheckOut = false;
            response.storeId = storeId;
        }
        return response;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = isEmployeeCheckedIn;

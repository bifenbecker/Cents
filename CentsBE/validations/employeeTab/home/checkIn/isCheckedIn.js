const TeamMembersCheckIn = require('../../../../models/teamMemberCheckIn');
const Store = require('../../../../models/store');

async function isEmployeeCheckedIn(teamMemberId, storeId = 0, checkIn) {
    try {
        const response = {};
        const isCheckedIn = await TeamMembersCheckIn.query().findOne({
            teamMemberId,
            isCheckedIn: true,
        });
        if (isCheckedIn) {
            const StoreAddress = await Store.query().findOne('id', isCheckedIn.storeId);
            if (checkIn) {
                if (isCheckedIn.storeId !== storeId) {
                    response.address = StoreAddress.name;
                    response.previousStore = StoreAddress.id;
                    response.error = true;
                    response.message = `You are already checked in at another store.Please check out from the last
                     store where you had checked-in`;
                } else {
                    response.error = true;
                    response.message = 'You are already checked -in.';
                }
            } else {
                response.valid = true;
                response.previousStore = StoreAddress.id;
            }
        }
        if (!checkIn && !isCheckedIn) {
            response.error = true;
            response.message = 'You are not checked in.';
        }
        return response;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = isEmployeeCheckedIn;

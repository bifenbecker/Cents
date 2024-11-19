const Pipeline = require('../../pipeline');

// Uows
const getGooglePlacesId = require('../../../uow/customer/address/getGooglePlacesAddressUow');
const createCustomerAddress = require('../../../uow/customer/address/createCustomerAddressUow');

async function createCustomerAddressPipeline(payload) {
    try {
        const customerAddressPipeline = new Pipeline([getGooglePlacesId, createCustomerAddress]);
        const output = await customerAddressPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createCustomerAddressPipeline;

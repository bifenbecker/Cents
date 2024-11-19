const Pipeline = require('../../pipeline');

// Uows
const getGooglePlacesId = require('../../../uow/customer/address/getGooglePlacesAddressUow');
const editCustomerAddress = require('../../../uow/customer/address/editCustomerAddressUow');

async function editCustomerAddressPipeline(payload) {
    try {
        const customerAddressPipeline = new Pipeline([getGooglePlacesId, editCustomerAddress]);
        const output = await customerAddressPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = editCustomerAddressPipeline;

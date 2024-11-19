const Pipeline = require('../../pipeline');

// Uows
const manageCustomerAddress = require('../../../uow/customer/address/manageCustomerAddressUow');

async function manageCustomerAddressPipeline(payload) {
    try {
        const customerAddressPipeline = new Pipeline([manageCustomerAddress]);
        const output = await customerAddressPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = manageCustomerAddressPipeline;

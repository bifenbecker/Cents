const Pipeline = require('../../pipeline');

// Uows
const deleteCustomerAddress = require('../../../uow/customer/address/deleteCustomerAddressUow');

async function deleteCustomerAddressPipeline(payload) {
    try {
        const customerAddressPipeline = new Pipeline([deleteCustomerAddress]);
        const output = await customerAddressPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = deleteCustomerAddressPipeline;

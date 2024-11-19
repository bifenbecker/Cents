const Pipeline = require('../../pipeline');

// Uows
const updateCustomerPhone = require('../../../uow/customer/phone/updatePhoneNumberUow');

async function updateCustomerPhoneNumberPipeline(payload) {
    try {
        const customerPhoneNumberPipeline = new Pipeline([updateCustomerPhone]);
        const output = await customerPhoneNumberPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateCustomerPhoneNumberPipeline;

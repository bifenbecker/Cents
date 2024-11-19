const Pipeline = require('../../pipeline');

// Uows
const getCustomerInformationUow = require('../../../uow/customer/information/getCustomerInformationUow');

async function getCustomerInformationPipeline(payload) {
    try {
        const customerInformationPipeline = new Pipeline([getCustomerInformationUow]);
        const output = await customerInformationPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getCustomerInformationPipeline;

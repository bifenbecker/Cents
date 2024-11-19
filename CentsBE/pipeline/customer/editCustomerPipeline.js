const Pipeline = require('../pipeline');

// Uows
const editCentsCustomer = require('../../uow/customer/editCentsCustomerUow');
const editChildStoreCustomer = require('../../uow/customer/editChildStoreCustomerUow');
const eventEmitter = require('../../config/eventEmitter');

/**
 * Update the CentsCustomer and associated StoreCustomer models for a given field
 *
 * @param {Object} payload
 * @returns {Object} output
 */
async function editCustomerPipeline(payload) {
    try {
        const customerPipeline = new Pipeline([editCentsCustomer, editChildStoreCustomer]);
        const output = await customerPipeline.run(payload);
        const { storeCustomers } = output;
        storeCustomers.map((storeCustomer) => eventEmitter.emit('indexCustomer', storeCustomer.id));
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = editCustomerPipeline;

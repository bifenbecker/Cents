const CentsCustomer = require('../../../models/centsCustomer');
const StoreCustomer = require('../../../models/storeCustomer');

/**
 * Update the phone number for a StoreCustomer model
 *
 * @param {Number} storeCustomerId
 * @param {String} phoneNumber
 */
async function updateStoreCustomer(storeCustomerId, phoneNumber, transaction) {
    await StoreCustomer.query(transaction)
        .patch({
            phoneNumber,
        })
        .findById(storeCustomerId)
        .returning('*');
}

/**
 * Update the phone number for the given CentsCustomer and associated StoreCustomer models
 *
 * @param {Object} payload
 */
async function updatePhoneNumber(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const centsCustomer = await CentsCustomer.query(transaction)
            .patch({
                phoneNumber: newPayload.phoneNumber,
            })
            .findById(newPayload.centsCustomerId)
            .returning('*');

        const storeCustomers = await StoreCustomer.query().where({
            centsCustomerId: centsCustomer.id,
        });

        const updatedStoreCustomers = storeCustomers.map((customer) =>
            updateStoreCustomer(customer.id, newPayload.phoneNumber, transaction),
        );

        await Promise.all(updatedStoreCustomers);

        newPayload.phoneNumber = centsCustomer.phoneNumber;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updatePhoneNumber;

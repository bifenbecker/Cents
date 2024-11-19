const StoreCustomer = require('../../models/storeCustomer');

/**
 * Edit the individual StoreCustomer fields
 *
 * @param {Object} storeCustomer
 * @param {Object} centsCustomer
 * @param {void} transaction
 */
async function editIndividualStoreCustomer(storeCustomer, centsCustomer, transaction) {
    const { phoneNumber, email, firstName, lastName, languageId } = centsCustomer;

    const updatedStoreCustomer = await StoreCustomer.query(transaction)
        .patch({
            phoneNumber,
            email,
            firstName,
            lastName,
            languageId,
        })
        .findById(storeCustomer.id)
        .returning('*');
    return updatedStoreCustomer;
}

/**
 * Edit the associated StoreCustomer fields for a given CentsCustomer
 *
 * @param {Object} payload
 */
async function editChildStoreCustomer(payload) {
    try {
        const newPayload = payload;
        const { centsCustomerId, transaction, centsCustomer } = newPayload;

        const storeCustomers = await StoreCustomer.query(transaction).where({ centsCustomerId });

        if (!storeCustomers || storeCustomers.length === 0) {
            return newPayload;
        }

        let updatedStoreCustomers = storeCustomers.map((customer) =>
            editIndividualStoreCustomer(customer, centsCustomer, transaction),
        );

        updatedStoreCustomers = await Promise.all(updatedStoreCustomers);
        newPayload.storeCustomers = updatedStoreCustomers;

        return newPayload;
    } catch (e) {
        throw new Error(e);
    }
}

module.exports = exports = editChildStoreCustomer;

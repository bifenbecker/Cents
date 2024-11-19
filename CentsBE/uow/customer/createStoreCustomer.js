const StoreCustomer = require('../../models/storeCustomer');

async function createStoreCustomer(payload) {
    try {
        const newPayload = payload;
        const {
            firstName,
            lastName,
            phoneNumber,
            languageId,
            storeId,
            businessId,
            centsCustomer,
            transaction,
        } = payload;

        let storeCustomer = await StoreCustomer.query(transaction).findOne({
            storeId,
            centsCustomerId: centsCustomer.id,
        });

        if (!storeCustomer) {
            storeCustomer = await StoreCustomer.query(transaction).insert({
                firstName,
                lastName,
                phoneNumber,
                languageId,
                storeId,
                businessId,
                centsCustomerId: centsCustomer.id,
            });
        }
        storeCustomer.centsCustomer = centsCustomer;
        newPayload.customer = centsCustomer;
        newPayload.storeCustomer = storeCustomer;
        newPayload.storeCustomerId = storeCustomer.id;
        newPayload.centsCustomerId = centsCustomer.id;
        return newPayload;
    } catch (e) {
        throw new Error(e);
    }
}

module.exports = createStoreCustomer;

const factory = require('../factories');

async function createCentsCustomerAndRelatedEntities(existingStore, centsCustomerData = {}) {
    let store = existingStore || await factory.create('store');

    const centsCustomer = await factory.create('centsCustomer', centsCustomerData);

    const storeCustomer = await factory.create('storeCustomer', {
        centsCustomerId: centsCustomer.id,
        storeId: store.id,
        businessId: store.businessId,
        firstName: centsCustomer.firstName,
        lastName: centsCustomer.lastName,
        email: centsCustomer.email,
        phoneNumber: centsCustomer.phoneNumber
    });
    return {centsCustomer, storeCustomer, store};
}
module.exports = {
    createCentsCustomerAndRelatedEntities,
}
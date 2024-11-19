const faker = require('faker');
const factory = require('../factories');
const { createCentsCustomerAndRelatedEntities } = require('../support/createCustomerHelper');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');

async function createOrderDeliveryAndRelatedEntities(existingStore, existingStoreCustomer) {
    let store = existingStore;
    let storeCustomer = existingStoreCustomer;

    if (!(storeCustomer && store)) {
        const { store: createdStore, storeCustomer: createdStoreCustomer } =
            createCentsCustomerAndRelatedEntities();
        store = createdStore;
        storeCustomer = createdStoreCustomer;
    }

    const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
        storeId: store.id,
        status: 'READY_FOR_PROCESSING',
        storeCustomerId: storeCustomer.id,
        netOrderTotal: faker.finance.amount(),
    });
    const order = await factory.create(FACTORIES_NAMES.order, {
        orderableId: serviceOrder.id,
        orderableType: 'ServiceOrder',
    });
    const orderDelivery = await factory.create(FACTORIES_NAMES.orderDelivery, {
        orderId: order.id,
        storeCustomerId: storeCustomer.id,
        storeId: store.id,
    });

    return {
        serviceOrder,
        order,
        orderDelivery,
    };
}

module.exports = {
    createOrderDeliveryAndRelatedEntities,
};

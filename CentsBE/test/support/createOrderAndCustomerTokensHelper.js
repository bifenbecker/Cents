const { createCentsCustomerAndRelatedEntities } = require('../support/createCustomerHelper');
const { createOrderDeliveryAndRelatedEntities } = require('../support/createOrderDeliveryHelper');
const {
    generateLiveLinkCustomerToken,
    generateLiveLinkOrderToken,
} = require('../support/apiTestHelper');

async function createEnvironmentForTokens() {
    const { centsCustomer, store, storeCustomer } = await createCentsCustomerAndRelatedEntities();
    const { serviceOrder, order, orderDelivery } = await createOrderDeliveryAndRelatedEntities(
        store,
        storeCustomer,
    );

    return {
        centsCustomer,
        store,
        storeCustomer,
        serviceOrder,
        order,
        orderDelivery,
    };
}

async function createOrderAndCustomerTokens(existingServiceOrderId, existingCentsCustomerId) {
    const customerToken = generateLiveLinkCustomerToken({
        id: existingCentsCustomerId,
    });
    const orderToken = generateLiveLinkOrderToken({
        id: existingServiceOrderId,
    });

    return { customerToken, orderToken };
}

async function createOrderAndCustomerTokensWithRelations() {
    const { centsCustomer, store, storeCustomer, serviceOrder, order, orderDelivery } =
        await createEnvironmentForTokens();

    const customerToken = generateLiveLinkCustomerToken({
        id: centsCustomer.id,
    });
    const orderToken = generateLiveLinkOrderToken({
        id: serviceOrder.id,
    });

    return {
        tokens: {
            customerToken,
            orderToken,
        },
        environment: {
            centsCustomer,
            store,
            storeCustomer,
            serviceOrder,
            order,
            orderDelivery,
        },
    };
}

module.exports = {
    createOrderAndCustomerTokensWithRelations,
    createOrderAndCustomerTokens,
};

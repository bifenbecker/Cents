const { getCustomerLastOrder } = require('../../../services/liveLink/queries/customer');
const getDeliverableServices = require('../../../services/liveLink/queries/DeliverableServices');
const ServiceOrder = require('../../../models/serviceOrders');
const OnlineOrderClone = require('../../../builders/cloning/onlineOrderClone');
const BusinessCustomerQuery = require('../../../queryHelpers/businessCustomerQuery');
const { getQueryParamsforServices } = require('../../../helpers/onlineOrderServicesQueryHelper');

async function getLastOrderDetails(payload) {
    const { businessId, zipCode } = payload.query;
    const recentCompletedStandardOrder = {};
    //  VALIDATION CAHECK :: Return empty object if user not logedIn.
    if (!payload.currentCustomer) return recentCompletedStandardOrder;
    const userId = payload.currentCustomer.id;
    const order = await getCustomerLastOrder(userId, zipCode, businessId);
    //  VALIDATION CAHECK :: Return empty object if no matching order
    if (!order) return recentCompletedStandardOrder;
    const serviceOrder = await ServiceOrder.query()
        .findById(order.id)
        .withGraphFetched('serviceOrderRecurringSubscription');
    //  VALIDATION CAHECK :: Return empty object if the order is recurring subscription.
    if (serviceOrder.serviceOrderRecurringSubscription) return recentCompletedStandardOrder;
    const orderCloneBuilder = new OnlineOrderClone(order.id);
    const clone = await orderCloneBuilder.build();
    const { servicePriceId, storeId, serviceModifierIds } = clone;

    const businessCustomerQuery = new BusinessCustomerQuery(payload.currentCustomer.id, businessId);
    const businessCustomer = await businessCustomerQuery.details();
    const servicesQueryPayload = await getQueryParamsforServices(
        businessCustomer,
        storeId,
        zipCode,
    );
    const services = await getDeliverableServices(servicesQueryPayload);

    const serviceUsed = services.find((service) =>
        service.prices.some((price) => price.id === servicePriceId),
    );
    //  VALIDATION CAHECK :: If the serviceUsed
    // not in the deliverible services return empty object.
    if (!serviceUsed) return recentCompletedStandardOrder;
    const modifiers = serviceUsed.serviceModifiers.filter((modifier) =>
        serviceModifierIds.includes(modifier.id),
    );
    //  Checking only for user selected modifiers from list.
    serviceUsed.serviceModifiers = modifiers;
    recentCompletedStandardOrder.clone = clone;
    recentCompletedStandardOrder.details = serviceUsed;
    return recentCompletedStandardOrder;
}

module.exports = exports = getLastOrderDetails;

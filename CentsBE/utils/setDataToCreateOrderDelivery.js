const Constants = require('../constants/constants');

const setDataToCreateOrderDelivery = (payload, type) => {
    const {
        serviceOrder,
        returnPayload,
        address,
        isProcessingCompleted,
        transaction,
        order,
        storeDetails,
        orderType,
    } = payload;
    return {
        store: storeDetails,
        order,
        orderType,
        storeCustomer: {
            id: serviceOrder.storeCustomerId,
            firstName: serviceOrder.firstName,
            lastName: serviceOrder.lastName,
            phoneNumber: serviceOrder.phoneNumber,
            email: serviceOrder.email || null,
            centsCustomerId: serviceOrder.centsCustomerId,
        },
        address,
        orderDelivery: {
            status: !isProcessingCompleted
                ? Constants.orderDeliveryStatuses.INTENT_CREATED
                : Constants.orderDeliveryStatuses.SCHEDULED,
            type,
            ...returnPayload,
        },
        thirdPartyDelivery: {
            id: returnPayload.thirdPartyDeliveryId,
            fee: returnPayload.thirdPartyDeliveryCostInCents,
            delivery_tracking_url: null,
        },
        centsCustomerAddressId: returnPayload.centsCustomerAddressId,
        transaction,
    };
};

module.exports = exports = setDataToCreateOrderDelivery;

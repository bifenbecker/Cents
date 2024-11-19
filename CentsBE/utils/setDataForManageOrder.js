const setDataForManageOrder = (payload, type) => {
    const { serviceOrder, returnPayload, customer, deliveryDetails, storeDetails, address } =
        payload;

    const newPayload = payload;
    newPayload.type = type;
    newPayload.orderDeliveryId = deliveryDetails.id;
    newPayload.orderDelivery = returnPayload;
    newPayload.deliveryTip = returnPayload.courierTip;
    newPayload.customer = customer;
    newPayload.fullStore = storeDetails;
    newPayload.address = address;
    newPayload.store = storeDetails;
    newPayload.storeCustomer = {
        id: serviceOrder.storeCustomerId,
    };
    return newPayload;
};

module.exports = exports = setDataForManageOrder;

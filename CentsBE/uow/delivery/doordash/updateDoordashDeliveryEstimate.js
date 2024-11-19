const DoordashEstimateService = require('../../../services/doordashEstimateService');
const getCentsCustomerAndAddressUow = require('../../liveLink/serviceOrders/getCentsCustomerAndAddressUow');
const OrderDelivery = require('../../../models/orderDelivery');

const updateDoordashDeliveryEstimate = async (payload) => {
    const { orderDelivery, currentStore, serviceOrder, transaction } = payload;

    if (orderDelivery.deliveryProvider !== 'DOORDASH') return payload;

    const centsCustomerAndAddress = await getCentsCustomerAndAddressUow({
        ...orderDelivery,
        transaction,
    });

    const storeId = currentStore.id;
    const customerAddress = centsCustomerAndAddress.address;
    const { netOrderTotal } = serviceOrder;
    const { deliveryWindow } = orderDelivery;
    const type = 'RETURN';

    const doordashEstimateService = new DoordashEstimateService(
        storeId,
        customerAddress,
        netOrderTotal,
        deliveryWindow,
        type,
    );
    const doordashEstimate = await doordashEstimateService.estimate();

    payload.serviceOrder.returnDeliveryFee = Number(
        (
            (Number(doordashEstimate.estimateFee) - Number(orderDelivery.subsidyInCents)) /
            100
        ).toFixed(2),
    );
    const updateOrderDelivery = await OrderDelivery.query(transaction)
        .patch({
            totalDeliveryCost: payload.serviceOrder.returnDeliveryFee,
        })
        .findById(orderDelivery.id)
        .returning('*');

    payload.orderDelivery = updateOrderDelivery;
    payload.doordashEstimate = doordashEstimate;
    return payload;
};

module.exports = exports = updateDoordashDeliveryEstimate;

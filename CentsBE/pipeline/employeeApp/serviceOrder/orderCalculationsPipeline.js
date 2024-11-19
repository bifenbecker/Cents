const Pipeline = require('../../pipeline');

// uow

const buildOrderItemsPayload = require('../../../uow/order/serviceOrder/buildOrderItemsPayload');
const {
    validateServiceOrderItems,
} = require('../../../uow/order/serviceOrder/validateServiceOrderItems');
const calculateTaxAmount = require('../../../uow/order/serviceOrder/calculateTaxAmount');
const calculatePromoAmount = require('../../../uow/order/serviceOrder/calculatePromoAmount');
const orderCalculations = require('../../../uow/order/serviceOrder/orderCalculations');
const setPickupandDeliveryFee = require('../../../uow/order/serviceOrder/setPickupAndDeliveryFee');
const orderCalculationsResponse = require('../../../uow/order/serviceOrder/orderCalculationsResponseMapper');
const getServiceOrderRecurringSubscription = require('../../../uow/order/serviceOrder/getServiceOrderRecurringSubscription');
const calculateRecurringDiscount = require('../../../uow/order/serviceOrder/calculateRecurringDiscount');
const getConvenienceFee = require('../../../uow/order/getConvenienceFee');

async function orderCalculationsPipeline(payload) {
    const orderCalculationsPipeline = new Pipeline([
        validateServiceOrderItems,
        buildOrderItemsPayload,
        calculatePromoAmount,
        getServiceOrderRecurringSubscription,
        calculateRecurringDiscount,
        calculateTaxAmount,
        setPickupandDeliveryFee,
        getConvenienceFee,
        orderCalculations,
        orderCalculationsResponse,
    ]);
    const result = await orderCalculationsPipeline.run(payload);
    return result;
}

module.exports = exports = orderCalculationsPipeline;

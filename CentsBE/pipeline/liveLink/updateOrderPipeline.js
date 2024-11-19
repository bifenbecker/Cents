const buildOrderItemsForUpdate = require('../../uow/liveLink/serviceOrders/buildOrderItemsForUpdate');
const fetchOrderItems = require('../../uow/liveLink/serviceOrders/fetchOrderItems');
const updateOnlineOrderPaymentIntent = require('../../uow/liveLink/serviceOrders/updateOnlineOrderPaymentIntent');
const manageCreditHistory = require('../../uow/order/serviceOrder/adjustOrder/manageCreditHistory');
const updateServiceOrder = require('../../uow/order/serviceOrder/adjustOrder/updateServiceOrder');
const updateOrderPromoDetails = require('../../uow/order/serviceOrder/adjustOrder/updateOrderPromoDetails');
const calculatePromoAmount = require('../../uow/order/serviceOrder/calculatePromoAmount');
const calculateTaxAmount = require('../../uow/order/serviceOrder/calculateTaxAmount');
const orderCalculations = require('../../uow/order/serviceOrder/orderCalculations');
const createOrderActivityLog = require('../../uow/createOrderActivityLogUOW');
const onlineOrderCalculationValidations = require('../../uow/order/serviceOrder/onlineOrder/onlineOrderCalculationValidations');
const adjustBalanceDue = require('../../uow/order/serviceOrder/adjustOrder/adjustBalanceDue');
const getServiceOrderRecurringSubscription = require('../../uow/order/serviceOrder/getServiceOrderRecurringSubscription');
const calculateRecurringDiscount = require('../../uow/order/serviceOrder/calculateRecurringDiscount');
const getConvenienceFee = require('../../uow/order/getConvenienceFee');
const Pipeline = require('../pipeline');

/**
 * update live-link order pipeline
 *
 * @param {*} payload
 * @return {*} output
 */
const updateOrderPipeline = async (payload) => {
    const updateOrder = new Pipeline([
        fetchOrderItems,
        calculatePromoAmount,
        getServiceOrderRecurringSubscription,
        calculateRecurringDiscount,
        calculateTaxAmount,
        onlineOrderCalculationValidations,
        getConvenienceFee,
        orderCalculations,
        buildOrderItemsForUpdate,
        updateServiceOrder,
        updateOrderPromoDetails,
        createOrderActivityLog,
        manageCreditHistory,
        updateOnlineOrderPaymentIntent,
        adjustBalanceDue,
    ]);
    const output = await updateOrder.run(payload);
    return output;
};
module.exports = exports = updateOrderPipeline;

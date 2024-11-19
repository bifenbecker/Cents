const Pipeline = require('../../pipeline');

// uow

const buildOrderItemsPayload = require('../../../uow/order/serviceOrder/buildOrderItemsPayload');
const updateInventoryItems = require('../../../uow/order/serviceOrder/updateInventoryItems');
const {
    validateServiceOrderItems,
} = require('../../../uow/order/serviceOrder/validateServiceOrderItems');
const createOrderActivityLog = require('../../../uow/createOrderActivityLogUOW');
const calculateTaxAmount = require('../../../uow/order/serviceOrder/calculateTaxAmount');
const calculatePromoAmount = require('../../../uow/order/serviceOrder/calculatePromoAmount');
const orderCalculations = require('../../../uow/order/serviceOrder/orderCalculations');
const removeDeletedOrderItems = require('../../../uow/order/serviceOrder/adjustOrder/removeDeletedOrderItems');
const buildReferenceItemsPayload = require('../../../uow/order/serviceOrder/buildReferenceItemsPayload');
const updateServiceOrder = require('../../../uow/order/serviceOrder/adjustOrder/updateServiceOrder');
const addAdjustmentLog = require('../../../uow/order/serviceOrder/adjustOrder/addAdjustmentLog');
const addWeightLog = require('../../../uow/order/serviceOrder/adjustOrder/addWeightLog');
const manageCreditHistory = require('../../../uow/order/serviceOrder/adjustOrder/manageCreditHistory');
const adjustBalanceDue = require('../../../uow/order/serviceOrder/adjustOrder/adjustBalanceDue');
const updateOrderPromoDetails = require('../../../uow/order/serviceOrder/adjustOrder/updateOrderPromoDetails');
const setPickupandDeliveryFee = require('../../../uow/order/serviceOrder/setPickupAndDeliveryFee');
const markOrderAsAdjusted = require('../../../uow/order/serviceOrder/adjustOrder/markOrderAsAdjusted');
const updateOnlineOrderPaymentIntent = require('../../../uow/liveLink/serviceOrders/updateOnlineOrderPaymentIntent');
const getSingleOrderLogic = require('../../../uow/singleOrder/getSingleOrderLogicUOW');
const getServiceOrderRecurringSubscription = require('../../../uow/order/serviceOrder/getServiceOrderRecurringSubscription');
const calculateRecurringDiscount = require('../../../uow/order/serviceOrder/calculateRecurringDiscount');
const updateServiceOrderBags = require('../../../uow/order/serviceOrder/adjustOrder/updateServiceOrderBags');
const updateHangerBundles = require('../../../uow/order/serviceOrder/adjustOrder/updateHangerBundles');
const updateStorageRacks = require('../../../uow/order/serviceOrder/adjustOrder/updateStorageRacks');
const getConvenienceFee = require('../../../uow/order/getConvenienceFee');
const updateStoreCustomerNotes = require('../../../uow/customer/updateNotes');

async function adjustServiceOrderPipeline(payload) {
    const { store, version, cents20LdFlag } = payload;

    const pipelineArray = [
        // remove deleted items
        // update existing items
        // insert new items
        // update inventory items
        // calculate tax
        // calculate promo
        // order calculations
        // update service order details
        // add adjustment log
        // add activity logs
        // add weight logs
        // manage credit history
        validateServiceOrderItems,
        removeDeletedOrderItems,
        buildOrderItemsPayload,
        buildReferenceItemsPayload,
        calculatePromoAmount,
        getServiceOrderRecurringSubscription,
        calculateRecurringDiscount,
        calculateTaxAmount,
        setPickupandDeliveryFee,
        getConvenienceFee,
        orderCalculations,
        updateServiceOrder,
        markOrderAsAdjusted,
        updateOrderPromoDetails,
        addAdjustmentLog,
        addWeightLog,
        createOrderActivityLog,
        manageCreditHistory,
        updateStoreCustomerNotes,
        updateInventoryItems,
        adjustBalanceDue,
        updateOnlineOrderPaymentIntent,
    ];

    if (version >= '2.0.0' && cents20LdFlag) {
        pipelineArray.push(updateServiceOrderBags, updateHangerBundles, updateStorageRacks);
    }

    const adjustServiceOrderPipeline = new Pipeline(pipelineArray);
    const {
        serviceOrder: { id },
    } = await adjustServiceOrderPipeline.run(payload);

    return getSingleOrderLogic(id, store, version, cents20LdFlag);
}

module.exports = exports = adjustServiceOrderPipeline;

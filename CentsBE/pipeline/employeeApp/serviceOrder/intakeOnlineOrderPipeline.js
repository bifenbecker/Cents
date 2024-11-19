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
const setpickupAndDeliveryFee = require('../../../uow/order/serviceOrder/setPickupAndDeliveryFee');
const removeDeletedOrderItems = require('../../../uow/order/serviceOrder/adjustOrder/removeDeletedOrderItems');
const buildReferenceItemsPayload = require('../../../uow/order/serviceOrder/buildReferenceItemsPayload');
const updateServiceOrder = require('../../../uow/order/serviceOrder/adjustOrder/updateServiceOrder');
const addAdjustmentLog = require('../../../uow/order/serviceOrder/adjustOrder/addAdjustmentLog');
const addWeightLog = require('../../../uow/order/serviceOrder/adjustOrder/addWeightLog');
const updateStatusAndNotes = require('../../../uow/order/serviceOrder/updateStatusAndNotes');
const manageCreditHistory = require('../../../uow/order/serviceOrder/adjustOrder/manageCreditHistory');
const adjustBalanceDue = require('../../../uow/order/serviceOrder/adjustOrder/adjustBalanceDue');
const updateOnlineOrderPaymentIntent = require('../../../uow/liveLink/serviceOrders/updateOnlineOrderPaymentIntent');
const updateOrderPromoDetails = require('../../../uow/order/serviceOrder/adjustOrder/updateOrderPromoDetails');
const updateServiceOrderBags = require('../../../uow/order/serviceOrder/adjustOrder/updateServiceOrderBags');
const updateHangerBundles = require('../../../uow/order/serviceOrder/adjustOrder/updateHangerBundles');
const updateStorageRacks = require('../../../uow/order/serviceOrder/adjustOrder/updateStorageRacks');
const getSingleOrderLogic = require('../../../uow/singleOrder/getSingleOrderLogicUOW');
const eventEmitter = require('../../../config/eventEmitter');
const { orderSmsEvents } = require('../../../constants/constants');
const getServiceOrderRecurringSubscription = require('../../../uow/order/serviceOrder/getServiceOrderRecurringSubscription');
const calculateRecurringDiscount = require('../../../uow/order/serviceOrder/calculateRecurringDiscount');

async function intakeOnlineOrderPipeline(payload) {
    const { store, cents20LdFlag, version } = payload;
    const pipelineArray = [
        validateServiceOrderItems,
        removeDeletedOrderItems,
        buildOrderItemsPayload,
        buildReferenceItemsPayload,
        calculatePromoAmount,
        getServiceOrderRecurringSubscription,
        calculateRecurringDiscount,
        calculateTaxAmount,
        setpickupAndDeliveryFee,
        orderCalculations,
        updateServiceOrder,
        updateOrderPromoDetails,
        updateStatusAndNotes,
        addAdjustmentLog,
        addWeightLog,
        createOrderActivityLog,
        manageCreditHistory,
        updateInventoryItems,
        updateOnlineOrderPaymentIntent,
        adjustBalanceDue,
    ];
    if (version >= '2.0.0' && cents20LdFlag) {
        pipelineArray.push(updateServiceOrderBags, updateHangerBundles, updateStorageRacks);
    }
    const intakeOrderPipeline = new Pipeline(pipelineArray);
    const {
        serviceOrder: { id },
    } = await intakeOrderPipeline.run(payload);
    eventEmitter.emit('orderSmsNotification', orderSmsEvents.INTAKE_COMPLETED, id);
    return getSingleOrderLogic(id, store, version, cents20LdFlag);
}

module.exports = exports = intakeOnlineOrderPipeline;

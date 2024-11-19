const Pipeline = require('../../pipeline');

// uow

const buildOrderItemsPayload = require('../../../uow/order/serviceOrder/buildOrderItemsPayload');
const updateCreditHistory = require('../../../uow/order/serviceOrder/updateCreditHistory');
const updateStoreCustomerNotes = require('../../../uow/customer/updateNotes');
const updateInventoryItems = require('../../../uow/order/serviceOrder/updateInventoryItems');
const {
    validateServiceOrderItems,
} = require('../../../uow/order/serviceOrder/validateServiceOrderItems');
const createOrder = require('../../../uow/order/createOrder');
const createOrderActivityLog = require('../../../uow/createOrderActivityLogUOW');
const createServiceOrderBags = require('../../../uow/order/serviceOrder/createServiceOrderBags');
const createHangerBundles = require('../../../uow/order/serviceOrder/createHangerBundles');
const createStorageRacks = require('../../../uow/order/serviceOrder/createStorageRacks');
const addOrderPromotionDetails = require('../../../uow/order/serviceOrder/addOrderPromotionDetails');
const createServiceOrder = require('../../../uow/order/serviceOrder/createServiceOrder');
const calculateTaxAmount = require('../../../uow/order/serviceOrder/calculateTaxAmount');
const calculatePromoAmount = require('../../../uow/order/serviceOrder/calculatePromoAmount');
const createServiceOrderWeightLogs = require('../../../uow/order/serviceOrder/createServiceOrderWeightLogs');
const orderCalculations = require('../../../uow/order/serviceOrder/orderCalculations');
const buildReferenceItemsPayload = require('../../../uow/order/serviceOrder/buildReferenceItemsPayload');
const getConvenienceFee = require('../../../uow/order/getConvenienceFee');

const eventEmitter = require('../../../config/eventEmitter');
const { orderSmsEvents } = require('../../../constants/constants');

const getSingleOrderLogic = require('../../../uow/singleOrder/getSingleOrderLogicUOW');

async function createServiceOrderPipeline(payload) {
    const { store, version, cents20LdFlag } = payload;
    const createServiceOrderPipeline = new Pipeline([
        validateServiceOrderItems,
        buildOrderItemsPayload,
        buildReferenceItemsPayload,
        calculatePromoAmount,
        calculateTaxAmount,
        getConvenienceFee,
        orderCalculations,
        createServiceOrder,
        createOrder,
        addOrderPromotionDetails,
        createServiceOrderBags,
        createStorageRacks,
        createHangerBundles,
        createServiceOrderWeightLogs,
        createOrderActivityLog,
        updateCreditHistory,
        updateStoreCustomerNotes,
        updateInventoryItems,
    ]);
    const {
        serviceOrder: { id },
    } = await createServiceOrderPipeline.run(payload);
    if (store.storeSettings && store.storeSettings.hasSmsEnabled) {
        eventEmitter.emit('orderSmsNotification', orderSmsEvents.ORDER_CREATED, id);
    }

    return getSingleOrderLogic(id, store, version, cents20LdFlag);
}

module.exports = exports = createServiceOrderPipeline;

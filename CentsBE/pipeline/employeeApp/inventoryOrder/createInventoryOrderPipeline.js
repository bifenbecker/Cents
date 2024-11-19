const Pipeline = require('../../pipeline');

// uow
const updateCreditHistory = require('../../../uow/order/serviceOrder/updateCreditHistory');
const buildOrderItemsPayload = require('../../../uow/order/serviceOrder/buildOrderItemsPayload');
const updateInventoryItems = require('../../../uow/order/serviceOrder/updateInventoryItems');
const {
    validateServiceOrderItems: validateInventoryOrderItems,
} = require('../../../uow/order/serviceOrder/validateServiceOrderItems');
const createOrder = require('../../../uow/order/createOrder');
const addOrderPromotionDetails = require('../../../uow/order/serviceOrder/addOrderPromotionDetails');
const createInventoryOrder = require('../../../uow/order/inventoryOrder/createInventoryOrder');
const calculateTaxAmount = require('../../../uow/order/serviceOrder/calculateTaxAmount');
const calculatePromoAmount = require('../../../uow/order/serviceOrder/calculatePromoAmount');
const orderCalculations = require('../../../uow/order/serviceOrder/orderCalculations');
const { queryFunction } = require('../../../routes/employeeTab/home/inventoryOrders/orderDetails');

async function createInventoryOrderPipeline(payload) {
    const { store } = payload;
    const createInventoryOrderPipeline = new Pipeline([
        validateInventoryOrderItems,
        buildOrderItemsPayload,
        calculatePromoAmount,
        calculateTaxAmount,
        orderCalculations,
        createInventoryOrder,
        createOrder,
        addOrderPromotionDetails,
        updateCreditHistory,
        updateInventoryItems,
    ]);
    const {
        inventoryOrder: { id },
    } = await createInventoryOrderPipeline.run(payload);
    return queryFunction(id, store);
}

module.exports = exports = createInventoryOrderPipeline;

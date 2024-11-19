const Pipeline = require('../../pipeline');

// Uows
const {
    validateServiceOrderItems,
} = require('../../../uow/order/serviceOrder/validateServiceOrderItems');
const buildOrderItemsPayload = require('../../../uow/order/serviceOrder/buildOrderItemsPayload');
const buildReferenceItemsPayload = require('../../../uow/order/serviceOrder/buildReferenceItemsPayload');
const calculateTaxAmount = require('../../../uow/order/serviceOrder/calculateTaxAmount');
const calculatePromoAmount = require('../../../uow/order/serviceOrder/calculatePromoAmount');
const orderCalculations = require('../../../uow/order/serviceOrder/orderCalculations');
const updateServiceOrder = require('../../../uow/order/serviceOrder/adjustOrder/updateServiceOrder');
const addWeightLogs = require('../../../uow/order/serviceOrder/adjustOrder/addWeightLog');
const createOrderActivityLog = require('../../../uow/createOrderActivityLogUOW');
const updateInventoryItems = require('../../../uow/order/serviceOrder/updateInventoryItems');
const notifyCustomer = require('../../../uow/order/serviceOrder/notifyCustomer');

const getSingleOrderLogic = require('../../../uow/singleOrder/getSingleOrderLogicUOW');
const updateStatusAndNotes = require('../../../uow/order/serviceOrder/updateStatusAndNotes');
const updateOrderPromoDetails = require('../../../uow/order/serviceOrder/adjustOrder/updateOrderPromoDetails');

/**
 * Intake Residential Order
 *
 * The pipeline contains the following units of work:
 *
 * 1) Remove deleted Order Items
 * 2) build order items payload
 * 3) build reference items payload
 * 4) calculate tax amount
 * 5) calculate promo amount
 * 6) order calculations
 * 7) update serviceOrder
 * 8) add weight logs
 * 9) create order activity log
 * 10) update inventory items
 * 11) notify customer
 *
 * @param {Object} payload
 */
async function intakeResidentialOrderPipeline(payload) {
    try {
        const { store, cents20LdFlag } = payload;
        const intakeResidentialOrder = new Pipeline([
            validateServiceOrderItems,
            buildOrderItemsPayload,
            buildReferenceItemsPayload,
            calculatePromoAmount,
            calculateTaxAmount,
            orderCalculations,
            updateServiceOrder,
            updateOrderPromoDetails,
            updateStatusAndNotes,
            addWeightLogs,
            createOrderActivityLog,
            updateInventoryItems,
            notifyCustomer,
        ]);
        const output = await intakeResidentialOrder.run(payload);

        return getSingleOrderLogic(output.serviceOrder.id, store, null, cents20LdFlag);
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = intakeResidentialOrderPipeline;

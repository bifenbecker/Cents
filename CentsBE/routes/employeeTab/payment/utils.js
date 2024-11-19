const ServiceOrder = require('../../../models/serviceOrders');
const ServiceOrderItem = require('../../../models/serviceOrderItem');
const ServiceReferenceItem = require('../../../models/serviceReferenceItem');
const InventoryOrderItem = require('../../../models/inventoryOrderItems');
const InventoryOrder = require('../../../models/inventoryOrders');

const updateInventoryCount = require('../inventory/updateInventoryCount');

/**
 * Get all inventory line items for a given serviceOrder
 *
 * @param {Number} orderId
 */
async function retrieveReferenceItem(orderId) {
    const serviceReferenceItem = await ServiceReferenceItem.query()
        .select(
            'serviceReferenceItems.id as referenceItemId',
            'serviceReferenceItems.inventoryItemId as inventoryItemId',
            'serviceReferenceItems.quantity as quantity',
        )
        .join(
            `${ServiceOrderItem.tableName} as orderItems`,
            'orderItems.id',
            'serviceReferenceItems.orderItemId',
        )
        .join(`${ServiceOrder.tableName} as orders`, 'orders.id', 'orderItems.orderId')
        .where({
            'orders.id': orderId,
            'serviceReferenceItems.servicePriceId': null,
            'serviceReferenceItems.serviceId': null,
            'serviceReferenceItems.serviceModifierId': null,
        });

    return serviceReferenceItem;
}

/**
 * Get all line items for a given inventoryOrder
 *
 * @param {Number} inventoryOrderId
 */
async function retrieveInventoryLineItems(inventoryOrderId) {
    const inventoryOrderLineItems = await InventoryOrderItem.query()
        .select(
            'id as lineItemId',
            'inventoryItemId as inventoryItemId',
            'lineItemQuantity as quantity',
        )
        .where({
            inventoryOrderId,
        });

    return inventoryOrderLineItems;
}

/**
 * Using the master order model, retrieve the specific sub-order
 *
 * @param {Object} order
 */
async function retrieveOrderableInformation(order) {
    const orderable = order.getOrderable();

    return orderable;
}

/**
 * Set the order status for the inventoryOrder
 *
 * @param {String} paymentStatus
 */
async function setInventoryOrderStatus(paymentStatus) {
    if (paymentStatus === 'PAID') return 'COMPLETED';

    return 'PAYMENT_REQUIRED';
}

/**
 * Determine the proper status the order should be updated to
 *
 * @param {String} paymentStatus
 * @param {Object} order
 * @param {Object} orderable
 * @param {Object} store
 */
async function getProperOrderStatus(paymentStatus, order, orderable, store) {
    const { orderableType } = order;

    if (orderableType === 'InventoryOrder') {
        return setInventoryOrderStatus(paymentStatus);
    }

    const beginningStatus = store.isIntakeOnly
        ? 'DESIGNATED_FOR_PROCESSING_AT_HUB'
        : 'READY_FOR_PROCESSING';

    if (paymentStatus === 'PAID' && orderable.paymentTiming === 'PRE-PAY') {
        return beginningStatus;
    }

    if (paymentStatus === 'BALANCE_DUE' && orderable.paymentTiming === 'PRE-PAY') {
        return 'PAYMENT_REQUIRED';
    }

    return orderable.status;
}

/**
 * Get all serviceOrder line items that contain products and update their inventory count
 *
 * @param {String} paymentStatus
 * @param {Number} orderableId
 * @param {void} trx
 */
async function updateInventoryForServiceOrder(paymentStatus, orderableId, trx) {
    const serviceReferenceItem = await retrieveReferenceItem(orderableId);

    if (serviceReferenceItem.length > 0 && paymentStatus === 'PAID') {
        const referenceItemResult = serviceReferenceItem.map((item) =>
            updateInventoryCount(item.inventoryItemId, item.quantity, trx),
        );
        await Promise.all(referenceItemResult);
    }
}

/**
 * Get all inventoryOrder line items that contain products and update their inventory count
 *
 * @param {String} paymentStatus
 * @param {Number} orderableId
 * @param {void} trx
 */
async function updateInventoryForInventoryOrder(paymentStatus, orderableId, trx) {
    const inventoryOrderLineItems = await retrieveInventoryLineItems(orderableId);

    if (inventoryOrderLineItems.length > 0 && paymentStatus === 'PAID') {
        const result = inventoryOrderLineItems.map((item) =>
            updateInventoryCount(item.inventoryItemId, item.quantity, trx),
        );
        await Promise.all(result);
    }
}

/**
 * Determine if order contains inventory items and adjust available inventory count accordingly
 *
 * @param {Object} order
 * @param {Number} orderableId
 * @param {String} paymentStatus
 * @param {void} trx
 */
async function adjustInventoryAmount(order, orderableId, paymentStatus, trx) {
    if (order.orderableType === 'ServiceOrder') {
        return updateInventoryForServiceOrder(paymentStatus, orderableId, trx);
    }

    return updateInventoryForInventoryOrder(paymentStatus, orderableId, trx);
}

/**
 * Based on the given orderableType, update the order sub-class
 *
 * @param {String} orderableType
 * @param {String} paymentStatus
 * @param {String} orderStatus
 * @param {Number} orderableId
 * @param {void} trx
 */
async function updateOrder(orderableType, paymentStatus, orderStatus, orderableId, trx) {
    const model = orderableType === 'ServiceOrder' ? ServiceOrder : InventoryOrder;

    const updatedModel = await model
        .query(trx)
        .patch({
            paymentStatus,
            status: orderStatus,
        })
        .findById(orderableId)
        .returning('*');

    return updatedModel;
}

module.exports = exports = {
    retrieveReferenceItem,
    retrieveInventoryLineItems,
    retrieveOrderableInformation,
    setInventoryOrderStatus,
    getProperOrderStatus,
    updateInventoryForServiceOrder,
    updateInventoryForInventoryOrder,
    adjustInventoryAmount,
    updateOrder,
};

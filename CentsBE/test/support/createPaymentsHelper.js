require('../testHelper');
const factory = require('../factories');
const InventoryOrder = require('../../models/inventoryOrders');

/**
 * Create many ServiceOrder entries for a given store
 * 
 * ServiceOrder entries should have the following defined:
 * 
 * 1) storeId
 * 2) netOrderTotal
 * 3) placedAt
 * 4) status
 * 5) employeeCode (if necessary)
 * 6) orderCode
 *
 * @param {Number} count
 * @param {Number} storeId
 */
async function createBasicServiceOrdersForStore(count, storeId, date, teamMember) {
    const serviceOrders = await factory.createMany('serviceOrder', count, {
        storeId,
        netOrderTotal: Math.floor(Math.random() * (100 - 1 + 1) + 1),
        placedAt: date,
        createdAt: date,
        status: 'READY_FOR_PROCESSING',
        employeeCode: teamMember.id || null,
        orderCode: Math.floor(Math.random() * (9999 - 1001 + 1) + 1001),
    });
    return serviceOrders;
}

/**
 * Create OrderActivityLog factories for an individual ServiceOrder
 * 
 * @param {Object} order 
 * @param {Object} teamMember 
 */
async function createOrderActivityLogForServiceOrder(order, teamMember) {
    const orderActivityLog = await factory.create('orderActivityLog', {
        orderId: order.id,
        status: order.status,
        teamMemberId: teamMember.id,
        employeeCode: teamMember.employeeCode,
        updatedAt: order.placedAt,
    });
    
    return orderActivityLog;
}

/**
 * Create many InventoryOrder entries for a given store
 * 
 * InventoryOrder entries should have the following defined:
 * 
 * 1) storeId
 * 2) netOrderTotal
 * 3) createdAt
 * 4) status === 'COMPLETED'
 * 5) employeeId (if necessary)
 * 6) orderCode
 * 
 * Additionally, we need to update the InventoryOrder after creating because there is a
 * beforeInsert hook that automatically sets the status as 'CREATED' if the netOrderTotal is 
 * not 0.
 *
 * @param {Number} count
 * @param {Number} storeId
 */
 async function createBasicInventoryOrdersForStore(count, storeId, date, teamMember) {
    const inventoryOrders = await factory.createMany('inventoryOrder', count, {
        storeId,
        netOrderTotal: Math.floor(Math.random() * (100 - 1 + 1) + 1),
        createdAt: date,
        status: 'COMPLETED',
        employeeId: teamMember.id || null,
        orderCode: Math.floor(Math.random() * (9999 - 1001 + 1) + 1001),
    });
    inventoryOrders.map(async order => (
        await InventoryOrder.query().patch({
            status: 'COMPLETED',
        }).findById(order.id)
    ))
    return inventoryOrders;
}

/**
 * Create a corresponding Order for a given orderableType
 *
 * @param {Number} orderId
 * @param {String} orderableType
 * @param {Number} storeId
 */
async function createOrderEntriesForOrderable(orderId, orderableType, storeId) {
    const order = await factory.create('order', {
        orderableId: orderId,
        orderableType: orderableType,
        storeId,
    });
    return order;
}

/**
 * Determine the proper value for the stripeClientSecret for payment entries
 * 
 * @param {String} processor 
 */
function getStripeClientSecretValue(processor) {
    if (processor === 'cash') {
        return 'cash';
    }

    if (processor === 'cashCard') {
        return 'cashCard';
    }

    return 'pi_test';
}

/**
 * Create a payment for a given store and order
 *
 * @param {Object} order
 * @param {Number} storeId
 * @param {String} date
 * @param {String} processor
 */
async function createPaymentsForOrder(order, storeId, date = null, processor = 'cash') {
    const model = await order.getOrderableModelClass();
    const orderable = await model.query().findById(order.orderableId);
    const payload = {
        storeId,
        orderId: order.id,
        paymentProcessor: processor === 'cashCard' ? 'CCI' : processor,
        stripeClientSecret: getStripeClientSecretValue(processor),
        totalAmount: orderable.netOrderTotal,
        appliedAmount: orderable.netOrderTotal,
        status: 'succeeded',
    };

    if (date) {
        payload.createdAt = date;
    }

    const payment = await factory.create('payments', payload);
    return payment;
}

/**
 * Sum up the total cash payments
 *
 * @param {Array} incomingArray
 */
function getSumTotalOfPayments(incomingArray) {
    const totalAmounts = incomingArray.map((item) => item.totalAmount);
    const totalPayments = totalAmounts.reduce((previous, currentItem) => previous + currentItem, 0);
    return totalPayments;
}

/**
 * Create the proper series of relations for multiple payments
 *
 * @param {Number} count
 * @param {Number} storeId
 * @param {String} date
 * @param {String} processor
 * @param {Object} teamMember
 */
async function createPaymentRelations(
    count,
    storeId,
    date = null,
    processor = 'cash',
    teamMember,
) {
    const serviceOrders = await createBasicServiceOrdersForStore(count, storeId, date, teamMember);
    
    let activityLog = serviceOrders.map(serviceOrder => createOrderActivityLogForServiceOrder(serviceOrder, teamMember));
    activityLog = await Promise.all(activityLog);

    let orders = serviceOrders.map((serviceOrder) => createOrderEntriesForOrderable(serviceOrder.id, 'ServiceOrder', storeId));
    orders = await Promise.all(orders);

    let payments = orders.map((order) =>
        createPaymentsForOrder(order, storeId, date, processor),
    );
    payments = await Promise.all(payments);

    return {
        serviceOrders,
        orders,
        payments,
    };
}

/**
 * Create the proper series of relations for multiple payments for inventory orders
 *
 * @param {Number} count
 * @param {Number} storeId
 * @param {String} date
 * @param {String} processor
 * @param {Object} teamMember
 */
async function createInventoryOrderPaymentRelations(
    count,
    storeId,
    date,
    processor = 'cash',
    teamMember
) {
    const inventoryOrders = await createBasicInventoryOrdersForStore(count, storeId, date, teamMember);
    let orders = inventoryOrders.map((inventoryOrder) => createOrderEntriesForOrderable(inventoryOrder.id, 'InventoryOrder', storeId));
    orders = await Promise.all(orders);
    let payments = orders.map((order) =>
        createPaymentsForOrder(order, storeId, date, processor),
    );
    payments = await Promise.all(payments);

    return {
        inventoryOrders,
        orders,
        payments,
    };
}

module.exports = {
    createOrderEntriesForOrderable,
    createPaymentsForOrder,
    getSumTotalOfPayments,
    createBasicServiceOrdersForStore,
    createPaymentRelations,
    createInventoryOrderPaymentRelations,
};

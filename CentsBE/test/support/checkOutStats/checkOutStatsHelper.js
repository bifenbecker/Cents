const InventoryOrder = require('../../../models/inventoryOrders');
const Order = require('../../../models/orders');
const Payment = require('../../../models/payment');
const ServiceOrder = require('../../../models/serviceOrders');

/**
 * Fetch the list of orders for a given employee during a given shift
 *
 * @param {Number} storeId
 * @param {Object} teamMemberCheckIn
 * @param {Object} teamMember
 */
async function fetchServiceOrdersForShift(storeId, teamMemberCheckIn, teamMember) {
    const { checkInTime, checkOutTime } = teamMemberCheckIn;
    const serviceOrders = await ServiceOrder.query()
        .select('serviceOrders.*')
        .innerJoin('orderActivityLog', 'orderActivityLog.orderId', 'serviceOrders.id')
        .where((builder) => {
            builder.whereBetween('orderActivityLog.updatedAt', [checkInTime, checkOutTime]);
        })
        .andWhere({
            storeId,
            'orderActivityLog.teamMemberId': teamMember.id,
        })
        .distinct();
    return serviceOrders;
}

/**
 * Format the completed orders required for the UoW payload
 *
 * @param {Number} storeId
 * @param {Array} completedOrders
 * @param {Array} inventoryOrders
 */
async function formatCompletedOrders(storeId, completedOrders, inventoryOrders) {
    const completedOrderIds = completedOrders.map((order) => order.id);
    const inventoryOrderIds = inventoryOrders.map((order) => order.id);
    const totalOrdersForEmployee = await Order.query()
        .where('storeId', storeId)
        .andWhere((builder) =>
            builder
                .whereIn('orderableId', completedOrderIds)
                .andWhere('orderableType', 'ServiceOrder'),
        )
        .orWhere((builder) =>
            builder
                .whereIn('orderableId', inventoryOrderIds)
                .andWhere('orderableType', 'InventoryOrder'),
        );
    return totalOrdersForEmployee;
}

/**
 * Fetch and format the list of InventoryOrders for a given shift
 *
 * @param {Number} storeId
 * @param {Object} teamMemberCheckIn
 * @param {Object} teamMember
 */
async function fetchInventoryOrdersForShift(storeId, teamMemberCheckIn, teamMember) {
    const { checkInTime, checkOutTime } = teamMemberCheckIn;
    const inventoryOrders = await InventoryOrder.query()
        .where((builder) => {
            builder.whereBetween('createdAt', [checkInTime, checkOutTime]);
        })
        .andWhere({
            employeeId: teamMember.id,
            storeId,
            status: 'COMPLETED',
        });
    return inventoryOrders;
}

/**
 * Fetch the list of ServiceOrder entries for a given employee/store/shift
 * 
 * @param {Number} storeId
 * @param {Object} teamMemberCheckIn
 * @param {Object} teamMember
 */
async function fetchProcessedOrdersForShift(storeId, teamMemberCheckIn, teamMember) {
    const { checkInTime, checkOutTime } = teamMemberCheckIn;
    const serviceOrders = await ServiceOrder.query()
        .select('serviceOrders.*')
        .innerJoin('orderActivityLog', 'orderActivityLog.orderId', 'serviceOrders.id')
        .where((builder) => {
            builder.whereBetween('orderActivityLog.updatedAt', [checkInTime, checkOutTime]);
        })
        .andWhere({
            storeId,
            'orderActivityLog.teamMemberId': teamMember.id,
            'orderActivityLog.status': 'PROCESSING',
        })
        .distinct();
    return serviceOrders;
}

/**
 * Given an individual payment and an orderable, return
 * an object with the totalAmount and orderCode
 *
 * @param {Object} payment
 * @param {Object} orderable
 */
function createObjectForOrderLineItem(payment, orderable) {
    return {
        orderCode: orderable.orderCode,
        totalAmount: payment.totalAmount,
    };
}

/**
 * Fetch the payment and the orderable for the Order model
 *
 * @param {Object} order
 */
async function fetchRelationsForOrder(order) {
    const payment = await Payment.query().where({ orderId: order.id }).first();
    const model = await order.getOrderableModelClass();
    const orderable = await model.query().findById(order.orderableId);

    return {
        payment,
        orderable,
    };
}

/**
 * Given a list of orders, create and format an array that,
 * for each order, contains objects of the payment totalAmount and order orderCode
 *
 * @param {Array} orders
 */
async function formatOrdersForLineItems(orders) {
    let orderInfo = orders.map((order) => fetchRelationsForOrder(order));
    orderInfo = await Promise.all(orderInfo);
    const formattedInfo = orderInfo.map((individualOrder) =>
        createObjectForOrderLineItem(individualOrder.payment, individualOrder.orderable),
    );
    return formattedInfo;
}

/**
 * Get a list of all processed ServiceOrders for a given employee
 * 
 * @param {Number} storeId
 * @param {Array} processedOrders
 */
async function getTotalOrdersProcessedForEmployee(storeId, processedOrders) {
    const processedOrderIds = processedOrders.map((order) => order.id);
    const totalProcessedOrdersForEmployee = await Order.query()
        .where({ storeId })
        .andWhere((builder) =>
            builder
                .whereIn('orderableId', processedOrderIds)
                .andWhere('orderableType', 'ServiceOrder'),
        );
    return totalProcessedOrdersForEmployee;
}

module.exports = {
  fetchServiceOrdersForShift,
  formatCompletedOrders,
  fetchInventoryOrdersForShift,
  formatOrdersForLineItems,
  fetchProcessedOrdersForShift,
  getTotalOrdersProcessedForEmployee,
};

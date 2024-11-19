const ServiceOrder = require('../../models/serviceOrders');
const InventoryOrder = require('../../models/inventoryOrders');
const Orders = require('../../models/orders');
const TeamMembers = require('../../models/teamMember');
const Business = require('../../models/laundromatBusiness');

/**
 *
 * @param {object} payload
 * @returns newPayload
 *
 * getTotalOrdersProcessed:
 * This function calculates the total orders processed by
 * the employee during its shift
 *
 * Section 2:
 * ServiceOrders with status PROCESSING, within time frame
 * of employee shift. Store Order Ids for the processingWeight UoW.
 *
 * Section 3:
 * All service orders w/ status completed, all inventory orders during the employees
 * shift
 */

async function getTotalOrdersProcessed(payload) {
    const newPayload = payload;
    const { teamMemberId, checkedOutTime, checkedInTime, previousStoreId, businessId } = newPayload;
    newPayload.totalProcessedOrdersForEmployee = [];
    newPayload.totalOrdersForEmployee = [];
    newPayload.serviceOrders = [];
    newPayload.inventoryOrders = [];
    newPayload.completedOrders = [];
    newPayload.processedOrders = [];

    try {
        const business = await Business.query().withGraphFetched('settings').findById(businessId);
        const isEmployeeCodeRequired = business.settings
            ? business.settings.requiresEmployeeCode
            : false;
        let serviceOrders = [];
        let inventoryOrders = [];
        let employeeCode = '';
        let processedOrders = [];
        /**
         * With Employee Code:
         * Get all completed service orders for the employee within their shift
         * Get all service orders processed during employees shift
         * Get all incomplete service orders for the employee within their shift
         * Get all inventory orders for the employee within their shift.
         *
         * TODO: completedAt date vs createdAt date for service orders
         * to match sales detail report
         */

        if (isEmployeeCodeRequired) {
            employeeCode = await TeamMembers.query().findOne('id', teamMemberId);
            serviceOrders = await ServiceOrder.query()
                .where((builder) => {
                    builder.whereBetween('createdAt', [checkedInTime, checkedOutTime]);
                })
                .andWhere({
                    employeeCode: employeeCode.id,
                    storeId: previousStoreId,
                });

            inventoryOrders = await InventoryOrder.query()
                .where((builder) => {
                    builder.whereBetween('createdAt', [checkedInTime, checkedOutTime]);
                })
                .andWhere({
                    employeeId: employeeCode.id,
                    storeId: previousStoreId,
                    status: 'COMPLETED',
                });
            const inventoryIds = inventoryOrders.map((order) => order.id);
            processedOrders = await ServiceOrder.query()
                .select('serviceOrders.*')
                .innerJoin('orderActivityLog', 'orderActivityLog.orderId', 'serviceOrders.id')
                .where((builder) => {
                    builder.whereBetween('orderActivityLog.updatedAt', [
                        checkedInTime,
                        checkedOutTime,
                    ]);
                })
                .andWhere({
                    storeId: previousStoreId,
                    'orderActivityLog.teamMemberId': employeeCode.id,
                    'orderActivityLog.status': 'PROCESSING',
                })
                .distinct();
            const allOrdersForEmployeeDuringShift = await ServiceOrder.query()
                .select('serviceOrders.*')
                .innerJoin('orderActivityLog', 'orderActivityLog.orderId', 'serviceOrders.id')
                .where((builder) => {
                    builder.whereBetween('orderActivityLog.updatedAt', [
                        checkedInTime,
                        checkedOutTime,
                    ]);
                })
                .andWhere({
                    storeId: previousStoreId,
                    'orderActivityLog.teamMemberId': employeeCode.id,
                })
                .distinct();
            const processedOrderIds = processedOrders.map((order) => order.id);
            const allIds = allOrdersForEmployeeDuringShift.map((order) => order.id);
            const totalProcessedOrdersForEmployee = await Orders.query()
                .where('storeId', previousStoreId)
                .andWhere((builder) =>
                    builder
                        .whereIn('orderableId', processedOrderIds)
                        .andWhere('orderableType', 'ServiceOrder'),
                );
            const totalOrdersForEmployee = await Orders.query()
                .where('storeId', previousStoreId)
                .andWhere((builder) =>
                    builder
                        .whereIn('orderableId', allIds)
                        .andWhere('orderableType', 'ServiceOrder'),
                )
                .orWhere((builder) =>
                    builder
                        .whereIn('orderableId', inventoryIds)
                        .andWhere('orderableType', 'InventoryOrder'),
                );
            newPayload.inventoryOrders = inventoryOrders;
            newPayload.processedOrders = processedOrders;
            newPayload.totalOrdersForEmployee = totalOrdersForEmployee;
            newPayload.totalProcessedOrdersForEmployee = totalProcessedOrdersForEmployee;
            newPayload.isEmployeeCodeRequired = true;
        } else {
            serviceOrders = await ServiceOrder.query()
                .where('storeId', previousStoreId)
                .whereBetween('createdAt', [checkedInTime, checkedOutTime]);
            inventoryOrders = await InventoryOrder.query()
                .where('storeId', previousStoreId)
                .whereBetween('createdAt', [checkedInTime, checkedOutTime]);
            newPayload.isEmployeeCodeRequired = false;
        }
        const serviceOrderIds = serviceOrders.map((order) => order.id);
        const inventoryOrderIds = inventoryOrders.map((order) => order.id);
        const newOrders = await Orders.query()
            .where('storeId', previousStoreId)
            .where((builder) =>
                builder
                    .whereIn('orderableId', serviceOrderIds)
                    .andWhere('orderableType', 'ServiceOrder'),
            )
            .orWhere((builder) =>
                builder
                    .whereIn('orderableId', inventoryOrderIds)
                    .andWhere('orderableType', 'InventoryOrder'),
            );
        const paymentOrderIds = newOrders.map((prop) => prop.id);
        newPayload.serviceOrders = serviceOrders;
        newPayload.inventoryOrderIds = inventoryOrderIds;
        newPayload.serviceOrderIds = serviceOrderIds;
        newPayload.orders = newOrders;
        newPayload.paymentOrderIds = paymentOrderIds;
        newPayload.employeeCode = employeeCode;
        return newPayload;
    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = exports = getTotalOrdersProcessed;

const { raw } = require('objection');
const ServiceOrder = require('../../../models/serviceOrders');
const TeamMember = require('../../../models/teamMember');
const OrderActivityLog = require('../../../models/orderActivityLog');
const { origins } = require('../../../constants/constants');

/**
 * This function updates the orderActivityLog for any updates on the order(serviceOrder)
 * @param {Integer} driverId
 * @param {Array} serviceOrderIds
 * @param {String} status
 * @param {*} transaction
 */
async function updateOrderActivityLog(driverId, serviceOrderIds, status, transaction) {
    const { fullName, employeeCode } = await TeamMember.query(transaction)
        .select(
            'teamMembers.id',
            'teamMembers.employeeCode',
            raw('concat(users.firstname, \' \', users.lastname) as "fullName"'),
        )

        .join('users', 'teamMembers.userId', 'users.id')
        .where('teamMembers.id', driverId)
        .first();

    const payload = serviceOrderIds.map((id) => ({
        orderId: id,
        status,
        updatedAt: new Date().toISOString(),
        employeeCode,
        employeeName: fullName,
        origin: origins.DRIVER_APP,
    }));
    await OrderActivityLog.query(transaction).insert(payload);
}

/**
 * This function updates the status of the serviceOrder and orderActivityLog
 * @param {Array} serviceOrderIds
 * @param {String} status
 * @param {Integer} driverId
 * @param {*} transaction
 */
async function updateServiceOrderStatus(serviceOrderIds, status, driverId, transaction) {
    await ServiceOrder.query(transaction)
        .patch({
            status,
            completedAt: ['DROPPED_OFF_AT_STORE', 'COMPLETED'].includes(status)
                ? new Date().toISOString()
                : null,
        })
        .whereIn('id', serviceOrderIds);
    await updateOrderActivityLog(driverId, serviceOrderIds, status, transaction);
}

module.exports = exports = updateServiceOrderStatus;

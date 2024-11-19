const { raw } = require('objection');
const { origins } = require('../constants/constants');
const OrderActivityLog = require('../models/orderActivityLog');
const TeamMember = require('../models/teamMember');

async function createOrderActivityLog(payload) {
    try {
        const newPayload = payload;

        let { employee } = newPayload;
        const serviceOrder = newPayload.updatedServiceOrder || newPayload.serviceOrder;
        if (!serviceOrder) throw new Error('missing serviceOrder');

        if (!employee && newPayload.driverId) {
            employee = await TeamMember.query(payload.transaction)
                .select(
                    'teamMembers.id',
                    'teamMembers.employeeCode',
                    raw('concat(users.firstname, \' \', users.lastname) as "fullName"'),
                )
                .join('users', 'teamMembers.userId', 'users.id')
                .where('teamMembers.id', newPayload.driverId)
                .first();
        }

        const orderActivityLogExists = await OrderActivityLog.query(newPayload.transaction).findOne(
            {
                orderId: serviceOrder.id,
                status: serviceOrder.status,
            },
        );

        if (orderActivityLogExists) {
            newPayload.orderActivityLog = orderActivityLogExists;
            return newPayload;
        }

        const activityLog = {
            orderId: serviceOrder.id,
            status: serviceOrder.status,
            notes: newPayload.notes || null,
            origin: newPayload.driverId ? origins.DRIVER_APP : newPayload.origin,
        };
        if (employee) {
            activityLog.employeeCode = employee.employeeCode;
            activityLog.employeeName =
                employee.fullName || `${employee.firstname} ${employee.lastname}`;
            activityLog.teamMemberId = employee.id;
        }

        const orderActivityLog = await OrderActivityLog.query(newPayload.transaction)
            .insert(activityLog)
            .returning('*');

        newPayload.orderActivityLog = orderActivityLog;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createOrderActivityLog;

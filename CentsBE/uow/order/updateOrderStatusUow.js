const ServiceOrder = require('../../models/serviceOrders');
const WeightLog = require('../../models/serviceOrderWeights');
const OrderItem = require('../../models/serviceOrderItem');
const TeamMember = require('../../models/teamMember');
const OrderActivityLog = require('../../models/orderActivityLog');
const ServiceOrderBags = require('../../models/serviceOrderBags');
const BusinessSettings = require('../../models/businessSettings');
const CreditHistory = require('../../models/creditHistory');
const StoreCustomer = require('../../models/storeCustomer');
const Payment = require('../../models/payment');
const Order = require('../../models/orders');
const StoreSettings = require('../../models/storeSettings');

const {
    employeeCodeIgnoreStatus,
    orderSmsEvents,
    origins,
    paymentStatuses,
    statuses,
} = require('../../constants/constants');

const updateInventory = require('../../services/inventory/inventoryItems');
const getInventoryItems = require('../../services/orders/serviceOrders/queries/getInventoryItems');

const capturePendingPayment = require('../payment/capturePendingPaymentUow');
const eventEmitter = require('../../config/eventEmitter');

async function performInventoryUpdate(order, trx) {
    const items = await getInventoryItems(order.orderableId, trx);
    if (items && items.length) {
        await updateInventory(order, items, trx);
    }
}

// statuses for which weight measurement is not to be done.
const disallowedWeightMeasurementStatuses = [
    'DESIGNATED_FOR_PROCESSING_AT_HUB',
    'IN_TRANSIT_TO_STORE',
    'IN_TRANSIT_TO_HUB',
    'RECEIVED_AT_HUB_FOR_PROCESSING',
    'DROPPED_OFF_AT_HUB',
];

async function addWeight(weightObj, transaction) {
    await WeightLog.query(transaction).insert({
        ...weightObj,
    });
}

function isProcessedAtStore(status, businessSettings) {
    if (
        (status === 'PROCESSING' && businessSettings.isWeightBeforeProcessing === false) ||
        (status === 'READY_FOR_PICKUP' && businessSettings.isWeightAfterProcessing === false) ||
        (status === 'COMPLETED' && businessSettings.isWeightUpOnCompletion === false)
    ) {
        return false;
    }
    return true;
}

function isProcessedAtHub(status, businessSettings) {
    if (
        (status === 'HUB_PROCESSING_ORDER' &&
            businessSettings.isWeightBeforeProcessing === false) ||
        (status === 'HUB_PROCESSING_COMPLETE' &&
            businessSettings.isWeightAfterProcessing === false) ||
        (status === 'READY_FOR_PICKUP' && businessSettings.isWeightReceivingAtStore === false) ||
        (status === 'COMPLETED' && businessSettings.isWeightUpOnCompletion === false)
    ) {
        return false;
    }
    return true;
}

async function checkWeightSettingsIsTrue(status, store, order, trx) {
    let isWeightRequired = true;
    const businessSettings = await BusinessSettings.query(trx)
        .where('businessId', store.businessId)
        .first();
    if (!order.isProcessedAtHub) {
        isWeightRequired = isProcessedAtStore(status, businessSettings);
    } else {
        isWeightRequired = isProcessedAtHub(status, businessSettings);
    }
    return isWeightRequired;
}

// async function updateCount(serviceReferenceItemId, bagCount, transaction) {
//     // one reference item for one orderItem.
//     await ServiceReferenceItem.query(transaction).patch({
//         quantity: bagCount,
//     }).findById(serviceReferenceItemId);
// }

async function employeeDetailsQuery(employeeCode, businessId, trx) {
    const employee = await TeamMember.query(trx)
        .select('teamMembers.id', 'users.firstname', 'users.lastname')
        .join('users', 'teamMembers.userId', 'users.id')
        .where('teamMembers.employeeCode', employeeCode)
        .andWhere('teamMembers.businessId', businessId);
    return employee;
}
// helper function to get employee details.
async function getEmployeeDetails(employeeCode, businessId, trx) {
    // only an employee with a valid employee code can proceed to this step (employee gating).
    const employee = await employeeDetailsQuery(employeeCode, businessId, trx);
    // existence of an employee is guaranteed.
    const { id, firstname, lastname } = employee[0];
    const resp = {};
    resp.id = id;
    resp.name = `${firstname} ${lastname}`;
    resp.employeeCode = employeeCode;
    return resp;
}

/**
 * Determine if the order has a pending payment and no successful payments or not
 *
 * @param {Number} serviceOrderId
 * @param {Number} netOrderTotal
 * @param {void} transaction
 */
async function findPendingPayment(serviceOrderId, netOrderTotal, transaction) {
    let successfulPaymentAmounts = null;
    let totalSuccessfulPayments = null;

    const order = await Order.query(transaction)
        .where({
            orderableId: serviceOrderId,
            orderableType: 'ServiceOrder',
        })
        .first();
    const pendingPayment = await Payment.query(transaction)
        .where({
            status: 'requires_confirmation',
            orderId: order.id,
        })
        .first();
    const successfulPayments = await Payment.query(transaction).where({
        status: 'succeeded',
        orderId: order.id,
    });

    if (successfulPayments && successfulPayments.length > 0) {
        successfulPaymentAmounts = successfulPayments.map((payment) => payment.totalAmount);
        totalSuccessfulPayments = successfulPaymentAmounts.reduce(
            (previous, currentItem) => previous + currentItem,
            0,
        );
    }

    if (successfulPayments && totalSuccessfulPayments === netOrderTotal) {
        return false;
    }

    return pendingPayment;
}

async function updateOrderStatusUow(payload) {
    const {
        id,
        transaction: trx,
        hubId,
        isProcessedAtHub,
        employeeCode,
        notifyUser,
        rack,
        status,
        notes,
        currentStore,
        weight,
        step,
        orderBeforeUpdate,
    } = payload;
    const { businessId, settings } = currentStore;

    const { requiresEmployeeCode, requiresRack, isWeightReceivingAtStore } = settings;

    const storeSettings = await StoreSettings.query(trx).findOne({
        storeId: orderBeforeUpdate.storeId,
    });
    let employee = {};
    const requiresAdditionalEmpVal =
        status === 'READY_FOR_PICKUP' && orderBeforeUpdate.isProcessedAtHub
            ? isWeightReceivingAtStore && requiresEmployeeCode
            : true;
    const employeeCodeRequirement =
        requiresEmployeeCode &&
        !employeeCodeIgnoreStatus.includes(status) &&
        requiresAdditionalEmpVal;
    if (employeeCodeRequirement) {
        employee = await getEmployeeDetails(employeeCode, businessId, trx);
    }
    let order = await ServiceOrder.query(trx).findById(id).returning('*');

    const updateOrder = {
        status,
        hubId,
        isProcessedAtHub,
        completedAt:
            status === 'COMPLETED' || status === 'CANCELLED' ? new Date().toISOString() : null,
        promotionId: status === 'CANCELLED' ? null : orderBeforeUpdate.promotionId,
        netOrderTotal:
            status === 'CANCELLED' ? orderBeforeUpdate.orderTotal : orderBeforeUpdate.netOrderTotal,
    };
    if (requiresRack && rack && status === 'READY_FOR_PICKUP') {
        updateOrder.rack = rack;
    }
    order = await ServiceOrder.query(trx)
        .withGraphFetched('order')
        .patch(updateOrder)
        .findById(id)
        .returning('*');
    // update the status for order items.
    await OrderItem.query(trx)
        .patch({
            status,
        })
        .where('orderId', id);
    // update the status for ServiceOrderBags

    await ServiceOrderBags.query(trx)
        .where('serviceOrderId', id)
        .patch({
            barcodeStatus: status,
            isActiveBarcode: !(status === 'CANCELLED' || status === 'COMPLETED'),
        });

    if (status === statuses.COMPLETED) {
        const pendingPayment = await findPendingPayment(id, order.netOrderTotal, trx);
        if (pendingPayment) {
            const { payment } = await capturePendingPayment({
                transaction: trx,
                serviceOrder: order,
                pendingPayment,
            });
            if (payment && payment.status === 'succeeded') {
                await order.$query(trx).patch({
                    balanceDue: 0,
                    paymentStatus: paymentStatuses.PAID,
                });
            }
        } else if (order.paymentStatus !== paymentStatuses.PAID) {
            throw new Error('Order is not paid');
        }
    }

    // adding credits back to the customer when order is voided
    if (status === 'CANCELLED') {
        const credit = await ServiceOrder.query(trx)
            .select('creditAmount', 'storeCustomerId')
            .findById(id);
        const storeCustomer = await StoreCustomer.query(trx)
            .select('centsCustomerId')
            .findById(credit.storeCustomerId)
            .first();
        await ServiceOrder.query(trx)
            .patch({
                creditAmount: null,
            })
            .findById(id);
        if (credit.creditAmount !== null) {
            await CreditHistory.query(trx).insert({
                businessId,
                reasonId: 1,
                amount: credit.creditAmount,
                customerId: storeCustomer.centsCustomerId,
            });
        }
        // update inventory.
        await performInventoryUpdate(order.order, trx);
    }

    // add weights to the db
    const isWeightRequired = await checkWeightSettingsIsTrue(status, currentStore, order, trx);
    if (
        weight &&
        weight.totalWeight &&
        isWeightRequired &&
        disallowedWeightMeasurementStatuses.indexOf(status) === -1
    ) {
        const { totalWeight, chargeableWeight } = weight;
        // add weight log.
        // TODO update
        await addWeight(
            {
                status,
                serviceOrderId: id,
                chargeableWeight,
                totalWeight,
                step,
                teamMemberId: employeeCodeRequirement ? employee.id : null,
            },
            trx,
        );
    }
    // add employeeCode to orderActivityLog when status changes
    await OrderActivityLog.query(trx).insert({
        orderId: id,
        status,
        employeeCode: employeeCodeRequirement ? employeeCode : null,
        teamMemberId: employeeCodeRequirement ? employee.id : null,
        employeeName: employeeCodeRequirement ? employee.name : null,
        notes,
        origin: origins.EMPLOYEE_APP,
    });

    // send sms
    if (status === 'COMPLETED' && storeSettings.hasSmsEnabled) {
        eventEmitter.emit('serviceOrderCompleted', { serviceOrderId: id });
    } else if (order.status === 'READY_FOR_PICKUP' && notifyUser && storeSettings.hasSmsEnabled) {
        eventEmitter.emit('orderSmsNotification', orderSmsEvents.READY_FOR_PICKUP, id);
    } else if (order.status === 'HUB_PROCESSING_COMPLETE' && storeSettings.hasSmsEnabled) {
        eventEmitter.emit('orderSmsNotification', orderSmsEvents.SEND_LIVE_LINK, id);
    }
    payload = {
        ...payload,
        serviceOrder: orderBeforeUpdate,
        storeCustomer: orderBeforeUpdate.storeCustomer,
        transaction: trx,
        order: orderBeforeUpdate.order,
        store: currentStore,
        customer: orderBeforeUpdate.storeCustomer.centsCustomer,
    };
    return payload;
}

module.exports = exports = updateOrderStatusUow;

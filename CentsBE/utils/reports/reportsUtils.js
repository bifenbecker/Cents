const momenttz = require('moment-timezone');
const getOrderCodePrefix = require('../getOrderCodePrefix');
const { ORDER_STATUS_PARAM_VALUES } = require('../../constants/constants');

/**
 * Generate the date range for a given report
 *
 * @param {String} startDate
 * @param {String} endDate
 * @param {String} timeZone
 */
//  USE ONLY IF startDate, endDate WERE NOT EDITED BEFORE USING THIS METHOD
function formatDateRangeForReportTitle(startDate, endDate, timeZone) {
    const formattedStartDate = momenttz(startDate, 'MM-DD-YYYY').tz(timeZone).format('MM-DD-YYYY');
    const formattedEndDate = momenttz(endDate, 'MM-DD-YYYY').tz(timeZone).format('MM-DD-YYYY');

    return `${formattedStartDate}-${formattedEndDate}`;
}

/**
 * Generate the date range for a given report without casting to tz
 *
 * @param {String} startDate
 * @param {String} endDate
 */
function formatDateRangeForReportTitleWOTimezone(startDate, endDate) {
    const formattedStartDate = momenttz(startDate, 'MM-DD-YYYY').format('MM-DD-YYYY');
    const formattedEndDate = momenttz(endDate, 'MM-DD-YYYY').format('MM-DD-YYYY');

    return `${formattedStartDate}-${formattedEndDate}`;
}

/**
 * Format start and end dates for timezone and timestamps
 *
 * @param {String} startDate
 * @param {String} endDate
 * @param {String} timeZone
 * @returns Array
 */
function getFormattedStartAndEndDates(startDate, endDate, timeZone) {
    const strippedStartDate = startDate.replace(/['"]+/g, '');
    const strippedEndDate = endDate.replace(/['"]+/g, '');
    const formattedStartDate = momenttz(strippedStartDate).tz(timeZone).format('MM-DD-YYYY');
    const formattedEndDate = momenttz(strippedEndDate).tz(timeZone).format('MM-DD-YYYY');
    const finalStartDate = `${formattedStartDate} 00:00:00`;
    const finalEndDate = `${formattedEndDate} 23:59:59`;

    return [finalStartDate, finalEndDate];
}

/**
 * Format given statuses array into array of objects
 *
 * @param {Array} statuses
 * @returns Array of objects
 */
function buildStatusesMap(statuses) {
    const statusesMap = [];
    for (let i = 0; i < statuses.length; i++) {
        statusesMap.push({ name: statuses[i] });
    }
    statusesMap[statuses.length - 1].last = true;
    return statusesMap;
}

/**
 * Map inventory order details
 * @param {Object} inventoryOrder
 * @param {String} timezone
 * @returns Array
 */

function mapInventoryOrderDetails(inventoryOrder, timezone, isTransactionsReport) {
    const {
        orderCode,
        lineItems,
        status,
        createdAt,
        order,
        store,
        customer,
        employee,
        netOrderTotal,
        paymentStatus,
        creditAmount,
        tipAmount,
    } = inventoryOrder;
    const customerName =
        customer && customer.id
            ? `${customer.firstName} ${customer.lastName ? customer.lastName : ''}`
            : '';
    const employeeName = employee
        ? `${employee.user.firstname} ${employee.user.lastname ? employee.user.lastname : ''}`
        : '';
    let products = [];
    for (const i of lineItems) {
        products.push(i.lineItemName);
    }
    products = [...new Set(products)].join();
    let paymentType;
    let esdReceiptNumber;
    let pickupFee = 0;
    let deliveryFee = 0;
    let transactionFee;
    let fundsReceived;
    let paymentMemo;
    if (order.payments && order.payments.length > 0) {
        paymentType = order.payments[0].paymentProcessor;
        esdReceiptNumber = order.payments[0].esdReceiptNumber;
        transactionFee = order.payments[0].transactionFee;
        if (isTransactionsReport) {
            fundsReceived = order.payments.map(
                (payment) => payment.totalAmount - payment.transactionFee,
            );
            fundsReceived = fundsReceived.reduce(
                (previousPayment, currentPayment) => previousPayment + currentPayment,
            );
        }
        paymentMemo = order.payments[0].paymentMemo;
    }
    if (order.delivery) {
        deliveryFee = order.delivery.totalDeliveryCost;
    }
    if (order.pickup) {
        pickupFee = order.pickup.totalDeliveryCost;
    }
    return isTransactionsReport
        ? {
              paymentDate: momenttz(createdAt).tz(timezone).format('MM-DD-YYYY'),
              paymentTime: momenttz(createdAt).tz(timezone).format('hh:mm A'),
              orderLocation: store.address,
              orderId: orderCode,
              customerName,
              customerPaid: netOrderTotal,
              transactionFee,
              fundsReceived,
              paymentMethod: `${paymentType === 'stripe' ? 'Cents' : paymentType}`,
              paymentEmployee: employeeName,
          }
        : [
              getOrderCodePrefix({ orderCode, orderType: 'INVENTORY' }),
              store.address,
              momenttz(createdAt).tz(timezone).format('MM-DD-YYYY'),
              momenttz(createdAt).tz(timezone).format('hh:mm A'),
              customerName,
              netOrderTotal,
              null,
              null,
              products,
              employeeName,
              employeeName,
              0,
              `${paymentType === 'stripe' ? 'Cents' : paymentType}`,
              paymentMemo,
              esdReceiptNumber,
              paymentStatus,
              status,
              creditAmount,
              tipAmount,
              pickupFee,
              deliveryFee,
              transactionFee,
          ];
}

const humanizedPaymentTypesMap = {
    stripe: 'Credit Card',
    cash: 'Cash',
    cashCard: 'Cash Card',
    ESD: 'Cash Card',
    CCI: 'Cash Card',
    Laundroworks: 'Cash Card',
    other: 'Other',
};

const paymentTypesMap = {
    stripe: 'creditCard',
    cash: 'cash',
    cashCard: 'cashCard',
    ESD: 'cashCard',
    CCI: 'cashCard',
    Laundroworks: 'cashCard',
    other: 'other',
};
/**
 * Return payment type according payment processor
 *
 * @param {String} paymentProcessor
 * @param {Boolean} isHumanized
 *
 */
function getPaymentType(paymentProcessor, isHumanized = false) {
    const mapType = isHumanized ? humanizedPaymentTypesMap : paymentTypesMap;
    return mapType[paymentProcessor] || '';
}

function getSubscriptionFutureDates(startDate, endDate, timeZone) {
    const today = momenttz.tz(timeZone).startOf('day').valueOf();
    const endDateValue = momenttz.tz(endDate, timeZone).startOf('day').valueOf();
    const startDateValue = momenttz.tz(startDate, timeZone).startOf('day').valueOf();
    if (endDateValue <= today) return [];

    if (startDateValue > today) return [startDate, endDate];

    const hour = momenttz.tz(timeZone).hours();
    if (startDateValue === today && hour > 19) {
        // Cronjob will run at 7PM a day beofe the scheduled pickup time. So we can exclude tomorrow
        return [
            momenttz.tz(timeZone).add(2, 'day').startOf('day').format('MM-DD-YYYY HH:mm:ss'),
            endDate,
        ];
    }

    return [
        momenttz.tz(timeZone).add(1, 'day').startOf('day').format('MM-DD-YYYY HH:mm:ss'),
        endDate,
    ];
}

function roundTo2Decimal(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Get report options by params
 * @param {Object} params
 * @returns Object
 */
function getReportOptions({
    businessId,
    tz,
    startDate,
    endDate,
    stores,
    allStoresCheck,
    allStoreIds,
    status,
}) {
    const timeZone = tz || 'UTC';
    const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
        startDate,
        endDate,
        timeZone,
    );
    const options = {
        businessId,
        timeZone,
        allStoreIds,
        storeIds: stores,
        allStoresCheck: ['true', true].includes(allStoresCheck),
        startDate: finalStartDate,
        endDate: finalEndDate,
        storeCount: stores.length,
    };

    switch (status) {
        case ORDER_STATUS_PARAM_VALUES.COMPLETED_ACTIVE_CANCELLED:
            break;
        case ORDER_STATUS_PARAM_VALUES.COMPLETED:
            options.statusCompleted = true;
            break;
        case ORDER_STATUS_PARAM_VALUES.COMPLETED_ACTIVE:
            options.statusCompletedAndActive = true;
            break;
        case ORDER_STATUS_PARAM_VALUES.COMPLETED_CANCELLED:
            options.statusCompletedAndCancelled = true;
            break;
        case ORDER_STATUS_PARAM_VALUES.ACTIVE:
            options.statusActive = true;
            break;
        case ORDER_STATUS_PARAM_VALUES.ACTIVE_CANCELLED:
            options.statusActiveAndCancelled = true;
            break;
        case ORDER_STATUS_PARAM_VALUES.CANCELLED:
            options.statusCancelled = true;
            break;
        default:
            break;
    }

    return options;
}

function mapCustomersReportResponse(customer, timeZone) {
    const currentDate = momenttz().tz(timeZone);
    const response = { ...customer };
    response.customerType = customer.isCommercial ? 'Commercial' : 'Residential';
    response.totalOrders = Number(customer.totalOrders);
    response.firstOrderDate = momenttz(customer.firstOrderDate).format('MM/DD/YYYY');
    response.lastOrderDate = momenttz(customer.lastOrderDate).format('MM/DD/YYYY');
    response.daysSinceLastOrder = currentDate
        .startOf('day')
        .diff(momenttz(customer.lastOrderDate).startOf('day'), 'days');
    delete response.isCommercial;
    return response;
}

module.exports = exports = {
    roundTo2Decimal,
    formatDateRangeForReportTitle,
    formatDateRangeForReportTitleWOTimezone,
    getFormattedStartAndEndDates,
    mapInventoryOrderDetails,
    buildStatusesMap,
    getPaymentType,
    getSubscriptionFutureDates,
    getReportOptions,
    mapCustomersReportResponse,
};

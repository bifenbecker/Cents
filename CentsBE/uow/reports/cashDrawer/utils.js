const momenttz = require('moment-timezone');
const getCashDrawerEndEvent = require('../../cashManagement/getCashDrawerEndEventUow');
const CashOutEvent = require('../../../models/cashOutEvent');
const findCashPaymentsForTimePeriod = require('../../cashManagement/findCashPaymentsForTimePeriodUow');

/**
 * Find the cash payments between a CashDrawerStartEvent and CashDrawerEndEvent
 *
 * @param {Object} startEvent
 * @param {Object} endingDate
 * @param {void} transaction
 * @param {Number} storeId
 */
async function findCashOutEventsForDrawerReport(startEvent, endingDate, storeId) {
    const cashOutEventsArray = [];
    const cashOutEvents = await CashOutEvent.query()
        .where({
            storeId: startEvent.storeId,
        })
        .andWhereBetween('createdAt', [startEvent.createdAt, endingDate]);

    if (cashOutEvents.length > 0) {
        cashOutEvents.forEach((cashOutEvent) => {
            const cashOutEventFormatting = {
                type: 'cashOut',
                employeeName: cashOutEvent.employeeName,
                totalCashChanged: cashOutEvent.totalCashChanged,
                amountLeftInDrawer: cashOutEvent.amountLeftInDrawer,
                createdAt: cashOutEvent.createdAt,
                cashOutType: cashOutEvent.type,
                memo: cashOutEvent.notes,
            };

            cashOutEventsArray.push(cashOutEventFormatting);
        });
    }

    const payload = {
        startingDate: startEvent.createdAt,
        endingDate,
        storeId,
    };
    const cashPaymentsOutput = await findCashPaymentsForTimePeriod(payload);
    let { cashTransactions } = cashPaymentsOutput;
    cashTransactions = await Promise.all(cashTransactions);
    cashTransactions = cashTransactions.map((transaction) => transaction);
    cashTransactions = cashOutEventsArray.concat(cashTransactions);

    return cashTransactions;
}

/**
 * Format each incoming cash drawer event
 *
 * @param {String} timeZone
 * @param {Number} storeId
 * @param {Object} cashDrawerEvent
 * @param {void} transaction
 */
async function formatCashDrawerDetails(timeZone, storeId, cashDrawerEvent) {
    const cashEvent = {};

    const formattedStartTime = momenttz(cashDrawerEvent.createdAt)
        .tz(timeZone)
        .format('MM-DD-YYYY hh:mm A');
    const formattedStartInfo = `Drawer Opened ${formattedStartTime} (${cashDrawerEvent.employeeName})`;

    cashEvent.startEmployeeName = cashDrawerEvent.employeeName;
    cashEvent.drawerStartTime = cashDrawerEvent.createdAt;
    cashEvent.formattedStartInfo = formattedStartInfo;
    cashEvent.startingCashAmount = cashDrawerEvent.startingCashAmount;

    const payload = {
        storeId,
        cashDrawerStartEvent: cashDrawerEvent,
    };
    const endEventOutput = await getCashDrawerEndEvent(payload);
    const { endEvent } = endEventOutput;

    if (endEvent) {
        const formattedEndTime = momenttz(endEvent.createdAt)
            .tz(timeZone)
            .format('MM-DD-YYYY hh:mm A');
        const formattedEndInfo = `Drawer Closed ${formattedEndTime} (${endEvent.employeeName})`;

        cashEvent.endEmployeeName = endEvent.employeeName;
        cashEvent.drawerEndTime = endEvent.createdAt;
        cashEvent.formattedEndInfo = formattedEndInfo;
        cashEvent.cashSalesAmount = endEvent.cashSalesAmount;
        cashEvent.cashRefundAmount = endEvent.cashRefundAmount;
        cashEvent.expectedInDrawer = endEvent.expectedInDrawer;
        cashEvent.actualInDrawer = endEvent.actualInDrawer;
    }

    const endingDate = endEvent ? endEvent.createdAt : new Date().toISOString();
    const cashTransactions = await findCashOutEventsForDrawerReport(
        cashDrawerEvent,
        endingDate,
        storeId,
    );
    cashEvent.cashTransactions = cashTransactions;
    cashEvent.timeZone = timeZone;

    return cashEvent;
}

module.exports = exports = {
    formatCashDrawerDetails,
};

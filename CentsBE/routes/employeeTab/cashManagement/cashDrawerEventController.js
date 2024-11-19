// Packages
const { transaction } = require('objection');

// Models
const CashDrawerStartEvent = require('../../../models/cashDrawerStartEvent');
const CashDrawerEndEvent = require('../../../models/cashDrawerEndEvent');
const CashOutEvent = require('../../../models/cashOutEvent');

// Pipelines
const endCashDrawerEventPipeline = require('../../../pipeline/employeeApp/cashManagement/endCashDrawerEventPipeline');

// UoWs and utils
const getTeamMember = require('../../../uow/teamMember/getTeamMemberUow');
const getListOfCashPayments = require('../../../uow/cashManagement/getListOfCashPaymentsUow');
const { calculateCashBalance } = require('./utils');

/**
 * Create a CashDrawerEvent with a starting amount of cash
 *
 * startingCashAmount comes in as a dollar amount and gets converted to
 * whole number integer in cents
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function startCashDrawerEvent(req, res, next) {
    let trx = null;

    try {
        const { currentStore, body } = req;
        const { employeeCode, startingCashAmount } = body;

        trx = await transaction.start(CashDrawerStartEvent.knex());

        const teamMemberPayload = {
            store: currentStore,
            employeeCode,
        };
        const teamMemberData = await getTeamMember(teamMemberPayload);
        const { teamMember } = teamMemberData;

        const cashDrawerEvent = await CashDrawerStartEvent.query(trx)
            .insert({
                storeId: currentStore.id,
                teamMemberId: teamMember.id,
                employeeCode,
                employeeName: `${teamMember.user.firstname} ${teamMember.user.lastname}`,
                startingCashAmount: Math.round(Number(startingCashAmount * 100)),
            })
            .returning('*');

        await trx.commit();

        return res.json({
            success: true,
            cashDrawerEvent,
            status: 'IN_PROGRESS',
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * End a CashDrawerEvent and required perform cash calculations
 *
 * Required cash calculations are:
 *
 * 1) cashSalesAmount = cash transactions between now and when the CashDrawerEvent began
 * 2) expectedInDrawer = (startingCashAmount + cashSalesAmount - cashRefundAmount)
 * 3) actualInDrawer = provided by user - dollar amount that gets converted into a whole number
 *                     integer in cents
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function endCashDrawerEvent(req, res, next) {
    try {
        const { currentStore, body } = req;
        const { employeeCode, actualInDrawer, cashDrawerEventId, cashInOutType, cashInOut } = body;
        const payload = {
            store: currentStore,
            employeeCode,
            actualInDrawer,
            cashDrawerEventId,
            cashInOutType,
            cashInOut,
        };

        const output = await endCashDrawerEventPipeline(payload);

        return res.json({
            success: true,
            cashDrawerEvent: output.endingCashDrawerEvent,
            status: 'REQUIRES_START',
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Determine the proper status to return for cash drawer events
 *
 * REQUIRES_START = requires new start event
 * IN_PROGRESS = requires new end event
 *
 * 1) If there isn't a startEvent or endEvent, then status is INACTIVE;
 * 2) If there is a startEvent but no latest endEvent, then status is IN_PROGRESS;
 * 3) If the startEvent createdAt time is greater than endEvent time, then status in IN_PROGRESS;
 * 4) If endEvent createdAt is greater than startEvent, then status is INACTIVE
 *
 * By default, return REQUIRES_START (i.e., new event)
 *
 * @param {Object} startEvent
 * @param {Object} endEvent
 */
async function determineProperStatus(startEvent, endEvent) {
    if (!startEvent && !endEvent) {
        return 'REQUIRES_START';
    }

    if (startEvent && !endEvent) {
        return 'IN_PROGRESS';
    }

    if (startEvent.createdAt > endEvent.createdAt) {
        return 'IN_PROGRESS';
    }

    if (startEvent.createdAt < endEvent.createdAt) {
        return 'REQUIRES_START';
    }

    return 'REQUIRES_START';
}

/**
 * Perform mathematic function to add up cashOut totals based on type
 *
 * @param {Array} cashOutArray
 * @returns {Number} totalCash
 */
function aggregateCashOutTotals(cashOutArray) {
    const totalCash = cashOutArray.reduce(
        (previous, currentItem) =>
            currentItem[1] === 'IN' ? previous + currentItem[0] : previous - currentItem[0],
        0,
    );

    return totalCash;
}

/**
 * Determine if a cash out occurred since drawer was started and return the cash in/out amount
 *
 * @param {Number} storeId
 * @param {String} startTime
 * @param {String} endTime
 */
async function getCashInOutAmount(storeId, startTime, endTime) {
    const cashOutEvent = await CashOutEvent.query()
        .where({
            storeId,
        })
        .andWhere('createdAt', '>=', startTime)
        .modify((queryBuilder) => {
            if (endTime) {
                queryBuilder.andWhere('createdAt', '<=', endTime);
            }
        })
        .returning('*');

    if (cashOutEvent.length > 0) {
        const cashOutTotalsArray = cashOutEvent.map((event) => [
            event.totalCashChanged,
            event.type,
        ]);
        const totalCash = aggregateCashOutTotals(cashOutTotalsArray);

        return [Math.abs(totalCash), Math.sign(totalCash) === 1 ? 'IN' : 'OUT'];
    }

    return [0, null];
}

/**
 * If the drawer is in progress, get details of the current drawer
 *
 * Current drawer is a compilation of starting drawer details and current cash sales
 *
 * @param {Object} store
 * @param {Object} startEvent
 * @param {void} trx
 */
async function getCurrentDrawerDetails(store, startEvent, trx) {
    const payload = {
        store,
        cashEvent: startEvent,
        transaction: trx,
    };
    const cashPaymentOutput = await getListOfCashPayments(payload);
    const currentCashBalance = await calculateCashBalance(cashPaymentOutput.cashPayments);
    const [cashInOutAmount, cashInOutType] = await getCashInOutAmount(
        store.id,
        startEvent.createdAt,
    );
    const expectedInDrawer =
        cashInOutType === 'IN'
            ? currentCashBalance + startEvent.startingCashAmount + cashInOutAmount
            : currentCashBalance + startEvent.startingCashAmount - cashInOutAmount;

    return {
        startedAt: startEvent.createdAt,
        startedBy: startEvent.employeeName,
        startingCashAmount: startEvent.startingCashAmount,
        cashSales: currentCashBalance,
        cashRefunds: 0,
        cashInOut: cashInOutAmount,
        cashInOutType,
        expectedInDrawer,
        cashDrawerStartEventId: startEvent.id,
    };
}

/**
 * Get the status of the current drawer
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 * @returns
 */
async function getCashDrawerStatus(req, res, next) {
    let trx = null;

    try {
        const { currentStore } = req;
        trx = await transaction.start(CashDrawerStartEvent.knex());

        const latestStartEvent = await CashDrawerStartEvent.query()
            .where({
                storeId: currentStore.id,
            })
            .orderBy('createdAt', 'desc')
            .first();

        const latestEndEvent = await CashDrawerEndEvent.query()
            .where({
                storeId: currentStore.id,
            })
            .orderBy('createdAt', 'desc')
            .first();

        const status = await determineProperStatus(latestStartEvent, latestEndEvent);
        const currentDrawer = latestStartEvent
            ? await getCurrentDrawerDetails(currentStore, latestStartEvent, trx)
            : {};

        await trx.commit();

        return res.json({
            success: true,
            startEvent: latestStartEvent,
            endEvent: latestEndEvent,
            currentDrawer,
            status,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Get the drawer history for a given store
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getCashDrawerHistory(req, res, next) {
    try {
        const { currentStore, query } = req;
        const { pageNumber } = query;

        const cashDrawerEndEvents = await CashDrawerEndEvent.query()
            .where({
                storeId: currentStore.id,
            })
            .orderBy('createdAt', 'desc')
            .page(pageNumber, 20);

        return res.json({
            success: true,
            history: cashDrawerEndEvents,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get a formatted historical Cash Drawer event. The event should include the following:
 *
 * 1) starting event details (started at, started by, starting amount)
 * 2) ending event details (ended at, ended by, ending amount)
 * 3) cash out totals
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getIndividualCashDrawerEvent(req, res, next) {
    try {
        const { currentStore, params } = req;
        const { endEventId } = params;

        const endEvent = await CashDrawerEndEvent.query().findById(endEventId);
        const startEvent = await CashDrawerStartEvent.query()
            .where({
                storeId: currentStore.id,
            })
            .andWhere('createdAt', '<', endEvent.createdAt)
            .orderBy('createdAt', 'desc')
            .first();

        const [cashInOutAmount, cashInOutType] = await getCashInOutAmount(
            currentStore.id,
            startEvent.createdAt,
            endEvent.createdAt,
        );

        const historicalData = {
            id: endEvent.id,
            startedAt: startEvent.createdAt,
            startedBy: startEvent.employeeName,
            endedAt: endEvent.createdAt,
            endedBy: endEvent.employeeName,
            startingCashAmount: startEvent.startingCashAmount,
            endingAmount: endEvent.actualInDrawer,
            cashSales: endEvent.cashSalesAmount,
            cashRefunds: endEvent.cashRefundAmount,
            cashInOut: cashInOutAmount,
            cashInOutType,
            expectedInDrawer: endEvent.expectedInDrawer,
            actualInDrawer: endEvent.actualInDrawer,
            cashDrawerStartEventId: startEvent.id,
        };

        return res.json({
            success: true,
            historicalEvent: historicalData,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = {
    startCashDrawerEvent,
    endCashDrawerEvent,
    getCashDrawerStatus,
    getCashDrawerHistory,
    getIndividualCashDrawerEvent,
};

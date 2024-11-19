// Packages
const { transaction } = require('objection');

// Models
const CashOutEvent = require('../../../models/cashOutEvent');

// Pipelines
const createCashOutEventPipeline = require('../../../pipeline/employeeApp/cashManagement/createCashOutEventPipeline');

// UoWs and utils
const getListOfCashPayments = require('../../../uow/cashManagement/getListOfCashPaymentsUow');
const { calculateCashBalance } = require('./utils');

/**
 * Record a new cash out event.
 *
 * 1) If this is the store's first cash out event, then find all cash transactions.
 *    Add up the totals of these cash transactions and then store appropriately.
 *
 * 2) If this is not the store's first cash out event, then find all cash transactions
 *    between current time and the createdAt date of the last cashOutEvent entry.
 *    Add up the totals of these cash transactions and then store appropriately
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 * @returns JSON
 */
async function createCashOutEvent(req, res, next) {
    const trx = null;

    try {
        const { currentStore, body } = req;
        const { employeeCode, type, cashActionAmount, notes } = body;
        const payload = {
            store: currentStore,
            employeeCode,
            cashActionAmount,
            type,
            notes,
        };

        const output = await createCashOutEventPipeline(payload);

        return res.json({
            success: true,
            cashOutEvent: output.cashOutEvent,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Retrieve the current cash balance for a store based on previous cashOutEvent
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function retrieveCurrentCashBalance(req, res, next) {
    let trx = null;

    try {
        const { currentStore } = req;

        trx = await transaction.start(CashOutEvent.knex());

        const latestCashOutEvent = await CashOutEvent.query()
            .where({
                storeId: currentStore.id,
            })
            .orderBy('createdAt', 'desc')
            .first();

        const payload = {
            store: currentStore,
            cashEvent: latestCashOutEvent,
            transaction: trx,
        };

        const cashPaymentOutput = await getListOfCashPayments(payload);
        const currentCashBalance = await calculateCashBalance(cashPaymentOutput.cashPayments);

        await trx.commit();

        return res.json({
            success: true,
            currentCashBalance,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Retrieve the last cash out event and information for a given store
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function retrieveLastCashOutEvent(req, res, next) {
    try {
        const { currentStore } = req;

        const cashOutEvent = await CashOutEvent.query()
            .where({
                storeId: currentStore.id,
            })
            .orderBy('createdAt', 'desc')
            .first();

        return res.json({
            success: true,
            cashOutEvent,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = {
    createCashOutEvent,
    retrieveCurrentCashBalance,
    retrieveLastCashOutEvent,
};

const { isEmpty } = require('lodash');
const Payment = require('../../models/payment');

/**
 * Get every cash payment recorded for a store
 *
 * @param {Number} storeId
 * @param {void} transaction
 */
async function getAllCashPaymentsForStore(storeId, transaction) {
    const cashPayments = await Payment.query(transaction)
        .where({
            storeId,
            paymentProcessor: 'cash',
        })
        .returning('*');

    return cashPayments;
}

/**
 * Get all cash payments for a store between given timestamps
 *
 * @param {*} storeId
 * @param {*} startTime
 * @param {void} transaction
 */
async function getCashPaymentsBetweenDates(storeId, startTime, transaction) {
    const cashPayments = await Payment.query(transaction)
        .where({
            storeId,
            paymentProcessor: 'cash',
        })
        .andWhere('createdAt', '>=', startTime)
        .returning('*');

    return cashPayments;
}

/**
 * Get a list of cash payments based on cash out event history
 *
 * If there isn't an existing cashEvent (meaning no cash drawer start events exist),
 * retrieve a list of all cash payments for a given store.
 *
 * Otherwise, get a list of cash payments between the current date and when the
 * cash drawer start event was created
 *
 * @param {Object} payload
 */
async function getListOfCashPayments(payload) {
    try {
        const newPayload = payload;
        const { store, transaction, cashEvent } = newPayload;

        let cashPayments = null;

        if (!cashEvent || isEmpty(cashEvent)) {
            cashPayments = await getAllCashPaymentsForStore(store.id, transaction);
        } else {
            cashPayments = await getCashPaymentsBetweenDates(
                store.id,
                cashEvent.createdAt,
                transaction,
            );
        }

        newPayload.cashPayments = cashPayments;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getListOfCashPayments;

const { isEmpty } = require('lodash');
const CashOutEvent = require('../../models/cashOutEvent');
const CashDrawerStartEvent = require('../../models/cashDrawerStartEvent');

/**
 * Sum the total of each item in the array
 *
 * @param {Array} totalArray
 */
async function getSumTotal(totalArray) {
    const totalPrice = totalArray.reduce(
        (previous, currentItem) => previous + currentItem * 100,
        0,
    );

    return totalPrice;
}

/**
 * Create a CashOutEvent model using incoming payload
 *
 * @param {Object} payload
 */
async function createCashOutEvent(payload) {
    try {
        const newPayload = payload;
        const {
            store,
            teamMember,
            transaction,
            cashPayments,
            employeeCode,
            type,
            cashActionAmount,
            notes,
            cashEvent,
        } = newPayload;
        let cashDrawerStartingAmount = 0;
        if (isEmpty(cashEvent)) {
            const latestStartEvent = await CashDrawerStartEvent.query()
                .where({
                    storeId: store.id,
                })
                .orderBy('createdAt', 'desc')
                .first();
            cashDrawerStartingAmount = latestStartEvent.startingCashAmount;
        }

        const totalCashArray = cashPayments.map((payment) => payment.appliedAmount);
        const paymentIds = cashPayments.map((payment) => payment.id);
        const cashTotal =
            totalCashArray.length > 0
                ? await getSumTotal(totalCashArray)
                : cashEvent.amountLeftInDrawer || cashDrawerStartingAmount;
        const formattedAmountChanged = cashActionAmount * 100;
        const totalCashChanged =
            type === 'OUT'
                ? cashTotal - formattedAmountChanged
                : cashTotal + formattedAmountChanged;

        const cashOutEvent = await CashOutEvent.query(transaction)
            .insert({
                storeId: store.id,
                totalCashPaymentSum: Math.round(cashTotal),
                employeeCode,
                teamMemberId: teamMember.id,
                employeeName: `${teamMember.user.firstname} ${teamMember.user.lastname}`,
                paymentIds,
                amountLeftInDrawer: Math.round(totalCashChanged),
                totalCashChanged: Math.round(formattedAmountChanged),
                type,
                notes,
            })
            .returning('*');

        newPayload.cashOutEvent = cashOutEvent;
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createCashOutEvent;

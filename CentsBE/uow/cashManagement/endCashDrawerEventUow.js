const CashDrawerEndEvent = require('../../models/cashDrawerEndEvent');

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
 * End a CashDrawerEvent model using incoming payload
 *
 * Required cash calculations are:
 *
 * 1) cashSalesAmount = cash transactions between now and when the CashDrawerEvent began
 * 2) expectedInDrawer = (startingCashAmount + cashSalesAmount - cashRefundAmount)
 * 3) actualInDrawer = provided by user
 *
 * @param {Object} payload
 */
async function endCashDrawerEvent(payload) {
    try {
        const newPayload = payload;
        const {
            store,
            teamMember,
            transaction,
            cashPayments,
            cashEvent,
            employeeCode,
            actualInDrawer,
            cashInOut,
            cashInOutType,
        } = newPayload;

        const totalCashSalesArray = cashPayments.map((payment) => payment.appliedAmount);
        const cashSalesTotal = await getSumTotal(totalCashSalesArray);
        const formattedActualInDrawer = actualInDrawer * 100;
        const expectedInDrawer =
            cashInOutType === 'IN'
                ? cashSalesTotal + cashEvent.startingCashAmount + cashInOut
                : cashSalesTotal + cashEvent.startingCashAmount - cashInOut;

        const endingCashDrawerEvent = await CashDrawerEndEvent.query(transaction)
            .insert({
                storeId: store.id,
                cashSalesAmount: Math.round(cashSalesTotal),
                employeeCode,
                teamMemberId: teamMember.id,
                employeeName: `${teamMember.user.firstname} ${teamMember.user.lastname}`,
                actualInDrawer: Math.round(formattedActualInDrawer),
                expectedInDrawer: Math.round(expectedInDrawer),
            })
            .returning('*');

        newPayload.endingCashDrawerEvent = endingCashDrawerEvent;
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = endCashDrawerEvent;

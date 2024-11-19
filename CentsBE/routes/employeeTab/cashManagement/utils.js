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
 * Determine current cash balance
 *
 * @param {Array} cashPayments
 */
async function calculateCashBalance(cashPayments) {
    if (cashPayments.length > 1) {
        const cashTotalArray = cashPayments.map((payment) => payment.appliedAmount);
        const currentCashBalance = await getSumTotal(cashTotalArray);
        return currentCashBalance;
    }

    if (cashPayments.length === 1) {
        const currentCashBalance = cashPayments[0].appliedAmount * 100;
        return currentCashBalance;
    }

    return 0;
}

module.exports = exports = {
    getSumTotal,
    calculateCashBalance,
};

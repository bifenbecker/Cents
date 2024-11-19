const { flatten } = require('lodash');
const stripe = require('../../../stripe/stripeWithSecret');
const { formatDateRangeForReportTitle } = require('../../../utils/reports/reportsUtils');
/**
 * For a given Stripe payout, retrieve the list of associated balance transactions
 *
 * @param {Object} payout
 * @param {String} connectAccountId
 */
async function getBalanceTransactionsPerPayout(payout, connectAccountId) {
    const balanceTransactions = [];
    const queryParams = {
        payout: payout.id,
        limit: 100,
        expand: ['data.source.source_transfer.source_transaction'],
    };
    for (let i = 0; i < 50; i++) {
        const { data, has_more: hasMore } = await stripe.balanceTransactions.list(queryParams, {
            stripeAccount: connectAccountId,
        });
        balanceTransactions.push(...data);
        if (!hasMore) {
            break;
        }
        if (hasMore) {
            queryParams.starting_after = balanceTransactions[balanceTransactions.length - 1].id;
        }
    }

    return balanceTransactions;
}

/**
 * Retrieve the list of balanceTransaction events for each individual payout
 *
 * @param {Object} payload
 */
async function getBalanceTransactionsForPayouts(payload) {
    try {
        const newPayload = payload;
        const { options, stripePayouts } = newPayload;
        const { business, finalStartDate, finalEndDate, timeZone } = options;

        let balanceTransactions = stripePayouts.map((payout) =>
            getBalanceTransactionsPerPayout(payout, business.merchantId),
        );
        balanceTransactions = await Promise.all(balanceTransactions);

        const reportTimeFrame = formatDateRangeForReportTitle(
            finalStartDate,
            finalEndDate,
            timeZone,
        );

        newPayload.balanceTransactions = flatten(balanceTransactions);
        newPayload.reportName = `Cents_Online_Payouts_${reportTimeFrame}.csv`;
        newPayload.reportHeaders = [
            { title: 'Transfer Amount', id: 'transferAmount' },
            { title: 'Transfer Initiated Date', id: 'createdAt' },
            { title: 'Transfer Expected Date *', id: 'arrivedAt' },
            { title: 'Customer PAID Amount', id: 'customerPaidAmount' },
            { title: 'To be PAID Out', id: 'toBePaidOut' },
            { title: 'Payment Date', id: 'paymentDate' },
            { title: 'Order Code', id: 'orderCode' },
            { title: 'Location Name', id: 'storeName' },
        ];
        newPayload.reportObjectType = 'object';
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getBalanceTransactionsForPayouts;

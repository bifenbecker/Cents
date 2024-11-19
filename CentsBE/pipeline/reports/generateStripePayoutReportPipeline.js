const Pipeline = require('../pipeline');

// Uows
const generateStripePayoutList = require('../../uow/reports/stripe/generateStripePayoutListUow');
const getBalanceTransactionsForPayouts = require('../../uow/reports/stripe/getBalanceTransactionsForPayoutsUow');
const mapBalanceTransactionsToRowHeaders = require('../../uow/reports/stripe/mapBalanceTransactionsToRowHeadersUow');
const writeReportDataToCsv = require('../../uow/reports/writeReportDataToCsvUow');
const sendReportToUser = require('../../uow/reports/sendReportToUserUow');
const deleteGeneratedReport = require('../../uow/reports/deleteGeneratedReportUow');

/**
 * Generate the Stripe payouts report of a given business and email it to the business owner
 *
 * The pipeline contains the following units of work:
 *
 * 1) Using report parameters, retrieve a list of all stripe payouts for the business
 * 2) Get a list of balanceTransactions per individual payout
 * 3) Map results to headers given the difference in layout we require for the report - TO DO
 * 4) Apply results to a CSV;
 * 5) Email CSV to the business owner;
 * 6) Delete the report from our filesystem;
 *
 * @param {Object} payload
 */
async function generateStripePayoutReportPipeline(payload) {
    try {
        const reportPipeline = new Pipeline([
            generateStripePayoutList,
            getBalanceTransactionsForPayouts,
            mapBalanceTransactionsToRowHeaders,
            writeReportDataToCsv,
            sendReportToUser,
            deleteGeneratedReport,
        ]);
        const output = await reportPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = generateStripePayoutReportPipeline;

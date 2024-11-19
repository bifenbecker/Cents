const Pipeline = require('../pipeline');

// Uows
const generateRefundsList = require('../../uow/reports/refunds/generateRefundsListUow');
const writeReportDataToCsv = require('../../uow/reports/writeReportDataToCsvUow');
const sendReportToUser = require('../../uow/reports/sendReportToUserUow');
const deleteGeneratedReport = require('../../uow/reports/deleteGeneratedReportUow');

/**
 * Generate the Refunds report of a given business and email it to the business owner
 *
 * The pipeline contains the following units of work:
 *
 * 1) Using report parameters, generate the report data and retrieve all results;
 * 2) Apply results to a CSV;
 * 3) Email CSV to the business owner;
 * 4) Delete the report from our filesystem;
 *
 * @param {Object} payload
 */
async function generateRefundsReportPipeline(payload) {
    try {
        const reportPipeline = new Pipeline([
            generateRefundsList,
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

module.exports = exports = generateRefundsReportPipeline;

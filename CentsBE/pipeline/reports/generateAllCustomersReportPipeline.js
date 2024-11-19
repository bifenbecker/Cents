const Pipeline = require('../pipeline');

// Uows
const generateAllCustomersReportData = require('../../uow/reports/allCustomers/generateAllCustomersReportDataUow');
const writeReportDataToCsv = require('../../uow/reports/writeReportDataToCsvUow');
const sendReportToUser = require('../../uow/reports/sendReportToUserUow');
const deleteGeneratedReport = require('../../uow/reports/deleteGeneratedReportUow');

/**
 * Generate the report of all customers for a business and email it to the business owner
 *
 * The pipeline contains the following units of work:
 *
 * 1) Using report parameters, generate the report data and retrieve all results;
 *      1a) Here we don't need to map results to headers, as we're defining that infomation
 *          in the first UoW
 * 2) Apply results to a CSV;
 * 3) Email CSV to the business owner;
 * 4) Delete the report from our filesystem;
 *
 * @param {Object} payload
 */
async function generateAllCustomersReportPipeline(payload) {
    try {
        const reportPipeline = new Pipeline([
            generateAllCustomersReportData,
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

module.exports = exports = generateAllCustomersReportPipeline;

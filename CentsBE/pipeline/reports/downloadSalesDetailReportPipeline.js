const Pipeline = require('../pipeline');

// Uows
const generateSalesDetailReportData = require('../../uow/reports/salesDetail/generateSalesDetailReportDataUow');
const mapSalesDetailDataToRows = require('../../uow/reports/salesDetail/mapSalesDetailDataToRowsUow');
const writeReportDataToCsv = require('../../uow/reports/writeReportDataToCsvUow');
const sendReportToUser = require('../../uow/reports/sendReportToUserUow');
const deleteGeneratedReport = require('../../uow/reports/deleteGeneratedReportUow');

/**
 * Generate the sales detail report and email it to the business owner
 *
 * The pipeline contains the following units of work:
 *
 * 1) Using report parameters, generate the report data and retrieve all results;
 * 2) Map details to rows;
 * 3) Apply results to a CSV;
 * 4) Email CSV to the business owner;
 * 5) Delete the report from our filesystem;
 *
 * @param {Object} payload
 */
async function generateSalesDetailReportPipeline(payload) {
    try {
        const reportPipeline = new Pipeline([
            generateSalesDetailReportData,
            mapSalesDetailDataToRows,
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

module.exports = exports = generateSalesDetailReportPipeline;

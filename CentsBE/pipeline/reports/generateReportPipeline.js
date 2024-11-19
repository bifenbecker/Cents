const Pipeline = require('../pipeline');

// Uows
const getReportDefinition = require('../../uow/reports/getReportDefinitionUow');
const getReportData = require('../../uow/reports/getReportDataUow');
const mapReportDataToRows = require('../../uow/reports/mapReportDataToRowsUow');
const writeReportDataToCsv = require('../../uow/reports/writeReportDataToCsvUow');
const sendReportToUser = require('../../uow/reports/sendReportToUserUow');
const deleteGeneratedReport = require('../../uow/reports/deleteGeneratedReportUow');

/**
 * Generate a CSV report and emails it to the specified user
 *
 * The pipeline contains the following units of work:
 *
 * 1) Using the reportType parameter, get the definition of the report;
 * 2) Using report parameters, generate the report data and retrieve all results;
 * 2) Map details to rows;
 * 3) Apply results to a CSV;
 * 4) Email CSV to the user;
 * 5) Delete the report from our filesystem;
 *
 * @param {Object} payload
 */
async function generateReportPipeline(payload) {
    try {
        const reportPipeline = new Pipeline([
            getReportDefinition,
            getReportData,
            mapReportDataToRows,
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

module.exports = exports = generateReportPipeline;

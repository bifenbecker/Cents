const inventorySalesReport = require('./inventorySales/inventorySalesReport');
const cashDrawerReport = require('./cashDrawer/cashDrawerReport');
const laborReport = require('./laborReport');
const transactionsReport = require('./transactionsReport');

const reports = {
    // add all report classes here
    inventorySalesReport,
    cashDrawerReport,
    laborReport,
    transactionsReport,
};

/**
 * Returns the definition class of a given report
 * @param {string} reportName
 * @returns {abstractCsvReport} reportDefinition
 */
function getReportDefinition(reportName) {
    if (reportName in reports) {
        return new reports[reportName]();
    }

    throw new Error(`Report ${reportName} not found`);
}

/**
 * Checks if the given reportName is valid
 * @param {string} reportName
 * @returns {Boolean} isValid
 */
function isValidReport(reportName) {
    return reportName in reports;
}

module.exports = {
    reports,
    getReportDefinition,
    isValidReport,
};

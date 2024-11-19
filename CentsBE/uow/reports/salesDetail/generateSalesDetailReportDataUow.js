const CustomQuery = require('../../../services/customQuery');

// utils
const { formatDateRangeForReportTitleWOTimezone } = require('../../../utils/reports/reportsUtils');

/**
 * Retrieve the sales detail report data using incoming query
 *
 * @param {Object} payload
 */
async function generateSalesDetailReportData(payload) {
    try {
        const newPayload = payload;
        const { options } = newPayload;

        const customQueryObject = new CustomQuery('reports/sales-report.sql', options);
        const reportData = await customQueryObject.execute();

        const reportTimeFrame = formatDateRangeForReportTitleWOTimezone(
            options.startDate,
            options.endDate,
        );

        newPayload.reportData = reportData;
        newPayload.reportTimeFrame = reportTimeFrame;
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = generateSalesDetailReportData;

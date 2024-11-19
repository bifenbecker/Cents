const CustomQuery = require('../../../services/customQuery');

// utils
const { formatDateRangeForReportTitleWOTimezone } = require('../../../utils/reports/reportsUtils');

/**
 * Retrieve the deliveries report data using incoming query
 *
 * @param {Object} payload
 */
async function generateDeliveriesReportData(payload) {
    try {
        const newPayload = payload;
        const { options } = newPayload;

        const customQueryObject = new CustomQuery('reports/deliveries-report.sql', options);
        const reportData = await customQueryObject.execute();

        const reportTimeFrame = formatDateRangeForReportTitleWOTimezone(
            options.startDate,
            options.endDate,
            options.timeZone,
        );

        newPayload.reportData = reportData;
        newPayload.reportTimeFrame = reportTimeFrame;
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = generateDeliveriesReportData;

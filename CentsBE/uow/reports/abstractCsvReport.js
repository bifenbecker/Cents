const { formatDateRangeForReportTitleWOTimezone } = require('../../utils/reports/reportsUtils');
const reportUtils = require('../../utils/reports/reportsUtils');

class AbstractCsvReport {
    initialize(params) {
        const requiredParams = this.getRequiredParams();

        // validate params
        for (const param of requiredParams) {
            if (params[param] === null || params[param] === undefined) {
                throw new Error(`Missing required param: ${param}`);
            }
        }

        // initialize internal variables
        for (const key in params) {
            if (requiredParams.includes(key)) {
                this[key] = params[key];
            }
        }
    }

    getReportName() {
        throw new Error('getReportName() not implemented');
    }

    getRequiredParams() {
        throw new Error('getRequiredParams() not implemented');
    }

    getReportObjectType() {
        return 'array';
    }

    getEmailParams() {
        return {};
    }

    getReportHeaders() {
        return null;
    }

    getReportData() {
        throw new Error('getReportData() not implemented');
    }

    getReportTimeFrame() {
        // if not applicable, override this method in subclasses

        const { startDate, endDate, timeZone } = this;

        const [finalStartDate, finalEndDate] = reportUtils.getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        return formatDateRangeForReportTitleWOTimezone(finalStartDate, finalEndDate, timeZone);
    }

    // eslint-disable-next-line no-unused-vars
    mapReportDataToRows(data, options = {}) {
        return data;
    }
}

module.exports = exports = AbstractCsvReport;

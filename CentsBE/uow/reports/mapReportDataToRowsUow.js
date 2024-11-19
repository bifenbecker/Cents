/**
 * Map the retrieved report data to proper columns
 *
 * @param {Object} payload
 */
function mapReportDataToRows(payload) {
    try {
        const newPayload = payload;
        const { reportDefinition, reportData, options } = newPayload;

        const baseTitle = reportDefinition.getReportName();
        const timeFrame = reportDefinition.getReportTimeFrame();
        const headers = reportDefinition.getReportHeaders();
        const data = reportDefinition.mapReportDataToRows(reportData, options);
        const reportObjectType = reportDefinition.getReportObjectType();

        newPayload.reportName = `${baseTitle}_${timeFrame}.csv`;
        newPayload.reportHeaders = headers;
        newPayload.finalReportData = data;
        newPayload.reportObjectType = reportObjectType;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = mapReportDataToRows;

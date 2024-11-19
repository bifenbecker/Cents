/**
 * Retrieve the report data using the report definition
 *
 * @param {Object} payload
 */
async function getReportData(payload) {
    try {
        const newPayload = payload;
        const { reportDefinition } = newPayload;

        const data = await reportDefinition.getReportData();

        newPayload.reportData = data;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getReportData;

const reports = require('./index');

/**
 * Retrieve the definition of the specified report using incoming query
 *
 * @param {Object} payload
 */
function getReportDefinition(payload) {
    try {
        const newPayload = payload;
        const { reportType, options } = newPayload;

        const definition = reports.getReportDefinition(reportType);
        definition.initialize(options);

        newPayload.reportDefinition = definition;

        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = getReportDefinition;

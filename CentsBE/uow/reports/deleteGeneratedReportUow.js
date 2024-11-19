const fs = require('fs');

/**
 * Retrieve the sales detail report data using incoming query
 *
 * @param {Object} payload
 */
async function deleteGeneratedReport(payload) {
    try {
        const newPayload = payload;
        const { reportName } = newPayload;
        fs.unlinkSync(reportName);
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = deleteGeneratedReport;

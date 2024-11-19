const fs = require('fs');
const createCsvWriterForArray = require('csv-writer').createArrayCsvWriter;
const createCsvWriterForObject = require('csv-writer').createObjectCsvWriter;

/**
 * Write the incoming report data to a CSV file
 *
 * @param {Object} payload
 */
async function writeReportDataToCsv(payload) {
    try {
        const newPayload = payload;
        const { finalReportData, reportName, reportHeaders, reportObjectType } = newPayload;
        const writer =
            reportObjectType === 'array' ? createCsvWriterForArray : createCsvWriterForObject;
        const csvWriter = writer({
            path: reportName,
            header: reportHeaders || null,
        });
        await csvWriter.writeRecords(finalReportData);
        const reportCsvData = fs.readFileSync(reportName).toString('base64');

        newPayload.reportCsvPath = reportName;
        newPayload.reportCsvData = reportCsvData;
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = writeReportDataToCsv;

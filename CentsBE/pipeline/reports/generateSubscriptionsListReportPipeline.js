const Pipeline = require('../pipeline');

const fetchStoresSubscriptionList = require('../../uow/reports/subscriptionsList/fetchStoresSubscriptionsList');
const writeReportDataToCsv = require('../../uow/reports/writeReportDataToCsvUow');
const sendReportToUser = require('../../uow/reports/sendReportToUserUow');
const deleteGeneratedReport = require('../../uow/reports/deleteGeneratedReportUow');
const mapSubscriptionsDataToRows = require('../../uow/reports/subscriptionsList/mapSubscriptionsDataToRows');

async function generateSubscriptionsListReport(payload) {
    const subscriptionReportPipeline = new Pipeline([
        fetchStoresSubscriptionList,
        mapSubscriptionsDataToRows,
        writeReportDataToCsv,
        sendReportToUser,
        deleteGeneratedReport,
    ]);
    return subscriptionReportPipeline.run(payload);
}

module.exports = exports = generateSubscriptionsListReport;

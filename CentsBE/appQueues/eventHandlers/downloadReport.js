const { pick } = require('lodash');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

// Pipeline
const downloadSalesDetailReportPipeline = require('../../pipeline/reports/downloadSalesDetailReportPipeline');
const downloadDeliveriesReportPipeline = require('../../pipeline/reports/downloadDeliveriesReportPipeline');
const generateAllCustomersReportPipeline = require('../../pipeline/reports/generateAllCustomersReportPipeline');
const generateReportPipeline = require('../../pipeline/reports/generateReportPipeline');
const generateStripePayoutReportPipeline = require('../../pipeline/reports/generateStripePayoutReportPipeline');
const generateRefundsReportPipeline = require('../../pipeline/reports/generateRefundsReportPipeline');
const { reports } = require('../../uow/reports/index');
const generateSubscriptionsListReport = require('../../pipeline/reports/generateSubscriptionsListReportPipeline');
const { REPORT_TYPES } = require('../../constants/constants');

/**
 * Run a pipeline to retrieve the sales detail report based on provided
 * query parameters and email the business manager
 *
 * @param {Object} job
 * @param {void} done
 */
async function downloadReport(job, done) {
    try {
        const { reportType } = job.data;
        const payload = pick(job.data, ['options', 'recipient', 'reportType']);

        // TODO (pratik): remove switch/case after existing background reports are migrated to abstracted pipeline
        switch (reportType) {
            case REPORT_TYPES.salesDetailReport:
                await downloadSalesDetailReportPipeline(payload);
                break;
            case REPORT_TYPES.allCustomersList:
                await generateAllCustomersReportPipeline(payload);
                break;
            case REPORT_TYPES.stripePayoutReport:
                await generateStripePayoutReportPipeline(payload);
                break;
            case REPORT_TYPES.stripeRefundsReport:
                await generateRefundsReportPipeline(payload);
                break;
            case REPORT_TYPES.deliveriesReport:
                await downloadDeliveriesReportPipeline(payload);
                break;
            case REPORT_TYPES.subscriptionsReport:
                await generateSubscriptionsListReport(payload);
                break;
            default:
                if (reportType in reports) {
                    await generateReportPipeline(payload);
                }
                break;
        }
        done();
    } catch (error) {
        LoggerHandler('error', error, {
            manualMessage: 'Error in downloading report.',
            job,
        });
        done(error);
    }
}

module.exports = exports = downloadReport;

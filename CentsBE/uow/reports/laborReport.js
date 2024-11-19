const AbstractCsvReport = require('./abstractCsvReport');
const CustomQuery = require('../../services/customQuery');
const reportUtils = require('../../utils/reports/reportsUtils');
const getOrderCodePrefix = require('../../utils/getOrderCodePrefix');
const getTimeFromInterval = require('../../utils/getTimeFromInterval');

class LaborReport extends AbstractCsvReport {
    getRequiredParams() {
        return ['startDate', 'endDate', 'timeZone', 'stores'];
    }

    getReportObjectType() {
        return 'object';
    }

    getReportName() {
        return 'Cents_Labor_Report';
    }

    getReportHeaders() {
        return [
            {
                title: 'Order Type',
                id: 'orderPrefix',
            },
            {
                title: 'Order Id',
                id: 'orderCode',
            },
            {
                title: 'Order Completed Date',
                id: 'completedAtDate',
            },
            {
                title: 'Order Total',
                id: 'orderTotal',
            },
            {
                title: 'Tip Total',
                id: 'tipTotal',
            },
            {
                title: 'Pounds At Intake',
                id: 'inTakePounds',
            },
            {
                title: 'Intake Employee',
                id: 'intakeEmployee',
            },
            {
                title: 'Intake Time',
                id: 'intakeTime',
            },
            {
                title: 'Pounds Before Processing',
                id: 'beforeProcessingPounds',
            },
            {
                title: 'Washing Employee',
                id: 'washingEmployee',
            },
            {
                title: 'Washing Time',
                id: 'washingTime',
            },
            {
                title: 'Drying Employee',
                id: 'dryingEmployee',
            },
            {
                title: 'Drying Time',
                id: 'dryingTime',
            },
            {
                title: 'Pounds After Processing',
                id: 'afterProcessingPounds',
            },
            {
                title: 'Pounds At Completion',
                id: 'completionPounds',
            },
            {
                title: 'Complete Processing Employee',
                id: 'completeProcessingEmployee',
            },
            {
                title: 'Completion Time',
                id: 'completedAtTime',
            },
            {
                title: 'Total Processing Time(Hours)',
                id: 'totalProcessingTime',
            },
            {
                title: 'Payment Employee',
                id: 'paymentEmployee',
            },
            {
                title: 'Payment Method',
                id: 'paymentMethod',
            },
            {
                title: 'Total Turnaround Time(Hours)',
                id: 'totalTurnaroundTime',
            },
            {
                title: 'Complete / Pickup Employee',
                id: 'completedEmployee',
            },
        ];
    }

    mapReportDataToRows(reportData) {
        return (
            reportData?.map((row) => {
                const {
                    orderType,
                    totalTurnaroundTimeStart,
                    completedAt,
                    totalProcessingTimeStart,
                    totalProcessingTimeEnd,
                    ...restRow
                } = row;

                return {
                    orderPrefix: getOrderCodePrefix({
                        orderType,
                    }).split('-')[0],
                    totalTurnaroundTime: getTimeFromInterval(totalTurnaroundTimeStart, completedAt),
                    totalProcessingTime: getTimeFromInterval(
                        totalProcessingTimeStart,
                        totalProcessingTimeEnd,
                    ),
                    ...restRow,
                };
            }) || []
        );
    }

    async getReportData() {
        const { startDate, endDate, timeZone, stores } = this;

        const [finalStartDate, finalEndDate] = reportUtils.getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const customQuery = new CustomQuery('reports/labor-report.sql', {
            storesIds: stores,
            startDate: finalStartDate,
            endDate: finalEndDate,
        });
        const reportData = await customQuery.execute();

        return reportData;
    }
}

module.exports = exports = LaborReport;

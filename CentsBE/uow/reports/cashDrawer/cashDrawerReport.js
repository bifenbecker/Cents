const moment = require('moment');
const { raw } = require('objection');
const AbstractCsvReport = require('../abstractCsvReport');
const Store = require('../../../models/store');

const reportUtils = require('../../../utils/reports/reportsUtils');
const { formatCashDrawerDetails } = require('./utils');
const logger = require('../../../lib/logger');

class CashDrawerReport extends AbstractCsvReport {
    getReportName() {
        return 'Cents_Cash_Drawer_Report';
    }

    getRequiredParams() {
        return ['startDate', 'endDate', 'timeZone', 'stores'];
    }

    getEmailParams() {
        return {
            storeCount: this.stores.length,
        };
    }

    getReportHeaders() {
        return [
            {
                title: 'Drawer Start',
                id: 'formattedStartInfo',
            },
            {
                title: 'Drawer End',
                id: 'formattedEndInfo',
            },
            {
                title: 'Beginning Cash',
                id: 'startingCashAmount',
            },
            {
                title: 'Cash Transactions',
                id: 'cashTransaction',
            },
            {
                title: 'Date',
                id: 'createdAt',
            },
            {
                title: 'Time',
                id: 'createdAtTime',
            },
            {
                title: 'Cash In',
                id: 'cashIn',
            },
            {
                title: 'Cash Out',
                id: 'cashOut',
            },
            {
                title: 'Employee Name',
                id: 'employeeName',
            },
            {
                title: 'Expected Ending Cash',
                id: 'expectedInDrawer',
            },
            {
                title: 'Actual Ending Cash',
                id: 'actualInDrawer',
            },
        ];
    }

    getReportObjectType() {
        return 'object';
    }

    async getReportData() {
        const finalCashDrawer = {};

        const { startDate, endDate, timeZone, stores } = this;

        const [finalStartDate, finalEndDate] = reportUtils.getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        if (stores.length > 1) {
            logger.error('Cash drawer report can only be generated for one store.');
        }

        const storeCashEvents = await Store.query()
            .withGraphJoined('[cashOutEvents, cashDrawerStartEvents, settings]')
            .whereIn('stores.id', stores)
            .andWhere(
                raw(
                    `CAST("cashDrawerStartEvents"."createdAt" AT TIME ZONE "settings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'`,
                ),
            )
            .first();

        if (!storeCashEvents || !storeCashEvents.cashDrawerStartEvents) {
            return [];
        }

        finalCashDrawer.store = storeCashEvents.name;

        const detailedCashEventPromises = storeCashEvents.cashDrawerStartEvents.map((event) =>
            formatCashDrawerDetails(storeCashEvents.settings.timeZone, storeCashEvents.id, event),
        );

        return Promise.all(detailedCashEventPromises);
    }

    mapReportDataToRows(reportData) {
        const results = [];

        reportData.forEach((event) => {
            results.push({
                formattedStartInfo: event.formattedStartInfo,
                formattedEndInfo: event.formattedEndInfo,
                startingCashAmount: Number(Number(event.startingCashAmount / 100).toFixed(2)),
                cashTransaction: '--',
                createdAt: '---',
                createdAtTime: '---',
                cashIn: '--',
                cashOut: '--',
                employeeName: '--',
                expectedInDrawer: Number(Number(event.expectedInDrawer / 100).toFixed(2)),
                actualInDrawer: Number(Number(event.actualInDrawer / 100).toFixed(2)),
            });
            results.push({});

            const { cashTransactions, timeZone } = event;

            cashTransactions.forEach((transaction) => {
                if (transaction.type === 'cashOut') {
                    results.push({
                        formattedStartInfo: '--',
                        formattedEndInfo: '--',
                        startingCashAmount: '--',
                        cashTransaction: `Employee cash ${transaction.cashOutType}: ${
                            transaction.memo ? transaction.memo : ''
                        }`,
                        createdAt: moment(transaction.createdAt).tz(timeZone).format('MM-DD-YYYY'),
                        createdAtTime: moment(transaction.createdAt).tz(timeZone).format('hh:mm A'),
                        cashIn:
                            transaction.cashOutType === 'IN'
                                ? Number(Number(transaction.totalCashChanged / 100).toFixed(2))
                                : '--',
                        cashOut:
                            transaction.cashOutType === 'OUT'
                                ? Number(Number(transaction.totalCashChanged / 100).toFixed(2))
                                : '--',
                        employeeName: transaction.employeeName,
                        expectedInDrawer: '--',
                        actualInDrawer: '--',
                    });
                }
                if (transaction.type === 'Sale') {
                    results.push({
                        formattedStartInfo: '--',
                        formattedEndInfo: '--',
                        startingCashAmount: '--',
                        cashTransaction: transaction.type,
                        createdAt: moment(transaction.createdAt).tz(timeZone).format('MM-DD-YYYY'),
                        createdAtTime: moment(transaction.createdAt).tz(timeZone).format('hh:mm A'),
                        cashIn: Number(Number(transaction.totalAmount).toFixed(2)),
                        cashOut: '--',
                        employeeName: '--',
                        expectedInDrawer: '--',
                        actualInDrawer: '--',
                    });
                }
            });
        });

        return results;
    }
}

module.exports = CashDrawerReport;

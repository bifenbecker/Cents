require('../../../../testHelper');
const momenttz = require('moment-timezone');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const cashDrawerReport = require('../../../../../uow/reports/cashDrawer/cashDrawerReport');
const StoreSettings = require('../../../../../models/storeSettings');

const storeTimeZone = 'America/Los_Angeles';
const userTimeZone = 'America/New_York';

const createdAtDate = new Date('5-15-2022').toISOString();

function getDrawerDateFormattedDate(date, timeZone) {
    return momenttz(date).tz(timeZone).format('MM-DD-YYYY hh:mm A');
}

function getTimezoneProcessedFullDate(date, timeZone) {
    return momenttz(date).tz(timeZone).format();
}

function getTimezoneProcessedDate(date, timeZone) {
    return momenttz(date).tz(timeZone).format('MM-DD-YYYY');
}

function getTimezoneProcessedTime(date, timeZone) {
    return momenttz(date).tz(timeZone).format('hh:mm A');
}

describe('test cashDrawerReport CSV report', () => {
    let reportDefinition;

    describe('test report metadata', () => {
        beforeEach(async () => {
            reportDefinition = new cashDrawerReport();
        });

        it('should have the correct report name', async () => {
            // act
            const reportName = reportDefinition.getReportName();

            // assert
            expect(reportName).to.equal('Cents_Cash_Drawer_Report');
        });

        it('should have all the required params', async () => {
            // arrange
            const expectedParams = ['startDate', 'endDate', 'timeZone', 'stores'];

            // act
            const reportParams = reportDefinition.getRequiredParams();

            // assert
            expectedParams.forEach((param) => {
                expect(reportParams).to.contain(param);
            });
        });

        it('should have all the email params', async () => {
            // arrange
            reportDefinition.stores = ['store1', 'store2', 'store3'];

            // act
            const emailParams = reportDefinition.getEmailParams();

            // assert
            expect(emailParams).to.have.property('storeCount', reportDefinition.stores.length);
        });

        it('should have all the report headers', async () => {
            // arrange
            const expectedHeaders = [
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

            // act
            const reportHeaders = reportDefinition.getReportHeaders();

            // assert
            expectedHeaders.forEach((expHeader) => {
                const headerObj = reportHeaders.find((header) => header.id === expHeader.id);
                expect(headerObj).to.not.be.undefined;
                expect(headerObj).to.have.property('title', expHeader.title);
            });
        });

        it('should have correct report object type', async () => {
            // act
            const objectType = reportDefinition.getReportObjectType();

            // assert
            expect(objectType).to.equal('object');
        });
    });

    describe('test getReportData', () => {
        let business,
            cashDrawerStartEvent,
            cashDrawerEndEvent,
            cashOutEvent1,
            cashOutEvent2,
            reportDefinition,
            store1,
            teamMember1,
            teamMember2;

        beforeEach(async () => {
            business = await factory.create('laundromatBusiness');
            store1 = await factory.create('store', {
                businessId: business.id,
            });

            teamMember1 = await factory.create('teamMember', {
                businessId: business.id,
            });
            teamMember2 = await factory.create('teamMember', {
                businessId: business.id,
            });

            cashDrawerStartEvent = await factory.create('cashDrawerStartEvent', {
                teamMemberId: teamMember1.id,
                storeId: store1.id,
                startingCashAmount: 2000,
                createdAt: getTimezoneProcessedFullDate(createdAtDate, userTimeZone),
            });
            cashOutEvent1 = await factory.create('cashOutEvent', {
                teamMemberId: teamMember2.id,
                storeId: store1.id,
                totalCashChanged: 500,
                amountLeftInDrawer: 1500,
                type: 'OUT',
                createdAt: getTimezoneProcessedFullDate(createdAtDate, userTimeZone),
            });
            cashOutEvent2 = await factory.create('cashOutEvent', {
                teamMemberId: teamMember1.id,
                storeId: store1.id,
                totalCashChanged: 1000,
                amountLeftInDrawer: 500,
                type: 'OUT',
                createdAt: getTimezoneProcessedFullDate(createdAtDate, userTimeZone),
            });
            cashDrawerEndEvent = await factory.create('cashDrawerEndEvent', {
                teamMemberId: teamMember1.id,
                storeId: store1.id,
            });

            reportDefinition = new cashDrawerReport();
        });

        it('single store', async () => {
            // arrange
            reportDefinition.initialize({
                startDate: getTimezoneProcessedDate('2022-05-01T21:42:04.055Z', userTimeZone),
                endDate: getTimezoneProcessedDate('2022-06-01T21:42:04.055Z', userTimeZone),
                timeZone: userTimeZone,
                stores: [store1.id],
                allStoresCheck: 'false',
                businessId: business.id,
            });
            await StoreSettings.query()
                .patch({
                    timeZone: storeTimeZone,
                })
                .whereIn('storeId', [store1.id]);

            // act
            const reportData = await reportDefinition.getReportData();

            // assert
            expect(reportData).to.be.an('array');
            expect(reportData).to.have.length(1);

            expect(reportData[0]).to.have.property(
                'startEmployeeName',
                cashDrawerStartEvent.employeeName,
            );
            expect(reportData[0]).to.have.property('drawerStartTime');
            expect(reportData[0].drawerStartTime.toISOString()).to.equal(createdAtDate);
            expect(reportData[0]).to.have.property('startingCashAmount', 2000);
            expect(reportData[0]).to.have.property('cashTransactions');
            expect(reportData[0].cashTransactions).to.be.an('array');
            expect(reportData[0].cashTransactions).to.have.length(2);

            const cashTransactions = reportData[0].cashTransactions;
            expect(reportData[0].formattedStartInfo).equal(
                `Drawer Opened ${getDrawerDateFormattedDate(createdAtDate, storeTimeZone)} (${
                    reportData[0].startEmployeeName
                })`,
            );
            expect(reportData[0].formattedEndInfo).equal(
                `Drawer Closed ${getDrawerDateFormattedDate(
                    cashDrawerEndEvent.createdAt,
                    storeTimeZone,
                )} (${reportData[0].endEmployeeName})`,
            );
            expect(cashTransactions[0]).to.have.property(
                'employeeName',
                cashOutEvent1.employeeName,
            );
            expect(cashTransactions[0]).to.have.property(
                'totalCashChanged',
                cashOutEvent1.totalCashChanged,
            );
            expect(cashTransactions[0]).to.have.property(
                'amountLeftInDrawer',
                cashOutEvent1.amountLeftInDrawer,
            );
            expect(cashTransactions[1]).to.have.property(
                'employeeName',
                cashOutEvent2.employeeName,
            );
            expect(cashTransactions[1]).to.have.property(
                'totalCashChanged',
                cashOutEvent2.totalCashChanged,
            );
            expect(cashTransactions[1]).to.have.property(
                'amountLeftInDrawer',
                cashOutEvent2.amountLeftInDrawer,
            );
        });

        it('no store cash events', async () => {
            // arrange
            reportDefinition.initialize({
                startDate: '2022-05-01T21:42:04.055Z',
                endDate: '2022-06-01T21:42:04.055Z',
                timeZone: 'America/Los_Angeles',
                stores: [42],
                allStoresCheck: 'false',
                businessId: business.id,
            });

            // act
            const reportData = await reportDefinition.getReportData();

            // assert
            expect(reportData).to.be.an('array');
            expect(reportData).to.have.length(0);
        });

        it('more than one stores', async () => {
            // arrange
            reportDefinition.initialize({
                startDate: '2022-05-01T21:42:04.055Z',
                endDate: '2022-06-01T21:42:04.055Z',
                timeZone: 'America/Los_Angeles',
                stores: [42, 67],
                allStoresCheck: 'false',
                businessId: business.id,
            });

            // act
            const reportData = await reportDefinition.getReportData();

            // assert
            expect(reportData).to.be.an('array');
            expect(reportData).to.have.length(0);
        });
    });

    it('test mapReportDataToRows', async () => {
        // arrange
        const data = [
            {
                startEmployeeName: 'Tom Cruise',
                drawerStartTime: '2022-03-15T06:36:17.623Z',
                formattedStartInfo: 'Drawer Opened 03-15-2022 02:36 AM (Tom Cruise)',
                startingCashAmount: 1000,
                endEmployeeName: 'Tom Cruise',
                drawerEndTime: '2022-03-30T10:17:16.052Z',
                formattedEndInfo: 'Drawer Closed 03-30-2022 06:17 AM (Tom Cruise)',
                cashSalesAmount: 250,
                cashRefundAmount: 0,
                expectedInDrawer: 950,
                actualInDrawer: 950,
                cashTransactions: [
                    {
                        type: 'cashOut',
                        employeeName: 'Tom Cruise',
                        totalCashChanged: 300,
                        amountLeftInDrawer: 700,
                        createdAt: getTimezoneProcessedFullDate(
                            '2022-03-15T06:37:24.828Z',
                            userTimeZone,
                        ),
                        cashOutType: 'OUT',
                        memo: null,
                    },
                    {
                        type: 'cashOut',
                        employeeName: 'Tom Cruise',
                        totalCashChanged: 500,
                        amountLeftInDrawer: 1200,
                        createdAt: getTimezoneProcessedFullDate(
                            '2022-03-16T05:02:34.252Z',
                            userTimeZone,
                        ),
                        cashOutType: 'IN',
                        memo: 'Cash in',
                    },
                    {
                        totalAmount: 100,
                        createdAt: getTimezoneProcessedFullDate(
                            '2022-03-21T07:27:54.266Z',
                            userTimeZone,
                        ),
                        type: 'Sale',
                    },
                    {
                        totalAmount: 150,
                        createdAt: getTimezoneProcessedFullDate(
                            '2022-03-30T07:37:47.948Z',
                            userTimeZone,
                        ),
                        type: 'Sale',
                    },
                ],
                timeZone: storeTimeZone,
            },
        ];
        const reportDefinition = new cashDrawerReport();

        // act
        const reportData = await reportDefinition.mapReportDataToRows(data);

        // assert
        expect(reportData).to.deep.equal([
            {
                formattedStartInfo: 'Drawer Opened 03-15-2022 02:36 AM (Tom Cruise)',
                formattedEndInfo: 'Drawer Closed 03-30-2022 06:17 AM (Tom Cruise)',
                startingCashAmount: 10,
                cashTransaction: '--',
                createdAt: '---',
                createdAtTime: '---',
                cashIn: '--',
                cashOut: '--',
                employeeName: '--',
                expectedInDrawer: 9.5,
                actualInDrawer: 9.5,
            },
            {},
            {
                formattedStartInfo: '--',
                formattedEndInfo: '--',
                startingCashAmount: '--',
                cashTransaction: 'Employee cash OUT: ',
                createdAt: getTimezoneProcessedDate('2022-03-15T06:37:24.828Z', storeTimeZone),
                createdAtTime: getTimezoneProcessedTime('2022-03-15T06:37:24.828Z', storeTimeZone),
                cashIn: '--',
                cashOut: 3,
                employeeName: 'Tom Cruise',
                expectedInDrawer: '--',
                actualInDrawer: '--',
            },
            {
                formattedStartInfo: '--',
                formattedEndInfo: '--',
                startingCashAmount: '--',
                cashTransaction: 'Employee cash IN: Cash in',
                createdAt: getTimezoneProcessedDate('2022-03-16T05:02:34.252Z', storeTimeZone),
                createdAtTime: getTimezoneProcessedTime('2022-03-16T05:02:34.252Z', storeTimeZone),
                cashIn: 5,
                cashOut: '--',
                employeeName: 'Tom Cruise',
                expectedInDrawer: '--',
                actualInDrawer: '--',
            },
            {
                formattedStartInfo: '--',
                formattedEndInfo: '--',
                startingCashAmount: '--',
                cashTransaction: 'Sale',
                createdAt: getTimezoneProcessedDate('2022-03-21T07:27:54.266Z', storeTimeZone),
                createdAtTime: getTimezoneProcessedTime('2022-03-21T07:27:54.266Z', storeTimeZone),
                cashIn: 100,
                cashOut: '--',
                employeeName: '--',
                expectedInDrawer: '--',
                actualInDrawer: '--',
            },
            {
                formattedStartInfo: '--',
                formattedEndInfo: '--',
                startingCashAmount: '--',
                cashTransaction: 'Sale',
                createdAt: getTimezoneProcessedDate('2022-03-30T07:37:47.948Z', storeTimeZone),
                createdAtTime: getTimezoneProcessedTime('2022-03-30T07:37:47.948Z', storeTimeZone),
                cashIn: 150,
                cashOut: '--',
                employeeName: '--',
                expectedInDrawer: '--',
                actualInDrawer: '--',
            },
        ]);
    });
});

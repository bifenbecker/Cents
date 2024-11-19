const momenttz = require('moment-timezone');
require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const TransactionsReport = require('../../../../uow/reports/transactionsReport');
const StoreSettings = require('../../../../models/storeSettings');

const storeTimeZone = 'America/Los_Angeles';
const userTimeZone = 'America/New_York';

describe(`tests transactionsReport UOW`, () => {
    let transactionsReport, user, business, teamMember, store, serviceOrder, payment, storeCustomer;

    beforeEach(async () => {
        user = await factory.create(FN.userWithBusinessOwnerRole);
        business = await factory.create(FN.laundromatBusiness, { userId: user.id });
        store = await factory.create(FN.store, {
            businessId: business.id,
        });
        teamMember = await factory.create(FN.teamMember, {
            userId: user.id,
            businessId: business.id,
        });
        storeCustomer = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            businessId: business.id,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            userId: user.id,
            storeId: store.id,
            employeeCode: teamMember.id,
            netOrderTotal: 0,
            storeCustomerId: storeCustomer.id,
            orderCode: '1111',
            status: 'COMPLETED',
        });
        const orderMaster = await factory.create(FN.serviceOrderMasterOrder, {
            orderableId: serviceOrder.id,
        });
        payment = await factory.create(FN.payment, {
            orderId: orderMaster.id,
            storeId: store.id,
            status: 'succeeded',
            createdAt: new Date('1-1-2021').toISOString(),
            updatedAt: new Date('1-1-2021').toISOString(),
        });
        transactionsReport = new TransactionsReport();
    });

    it('test getRequiredParams', async () => {
        const requiredParams = transactionsReport.getRequiredParams();
        expect(requiredParams).to.deep.equal([
            'startDate',
            'endDate',
            'timeZone',
            'stores',
            'status',
            'allStoresCheck',
            'businessId',
            'allStoreIds',
        ]);
    });

    it('test getReportObjectType', async () => {
        const objectType = transactionsReport.getReportObjectType();
        expect(objectType).to.equal('object');
    });

    it('test getReportName', async () => {
        const reportName = transactionsReport.getReportName();
        expect(reportName).to.equal('Cents_Transactions_Report');
    });

    it('test getReportHeaders', async () => {
        const reportHeaders = transactionsReport.getReportHeaders();
        expect(reportHeaders).to.deep.equal([
            {
                title: 'Payment Date',
                id: 'paymentDate',
            },
            {
                title: 'Payment Time',
                id: 'paymentTime',
            },
            {
                title: 'Order Location',
                id: 'orderLocation',
            },
            {
                title: 'Order ID',
                id: 'orderId',
            },
            {
                title: 'Customer Name',
                id: 'customerName',
            },
            {
                title: 'Customer Paid',
                id: 'customerPaid',
            },
            {
                title: 'Transaction Fee',
                id: 'transactionFee',
            },
            {
                title: 'Funds Received',
                id: 'fundsReceived',
            },
            {
                title: 'Payment Method',
                id: 'paymentMethod',
            },
            {
                title: 'Payment Employee',
                id: 'paymentEmployee',
            },
        ]);
    });

    it('test mapReportDataToRows', async () => {
        const expectedResult = 'SOME_STRING';
        const result = transactionsReport.mapReportDataToRows(expectedResult);
        expect(result).to.equal(expectedResult);
    });

    describe('test getReportData', () => {
        it('should return expected result', async () => {
            const options = {
                startDate: new Date('1-1-2020').toISOString(),
                endDate: new Date().toISOString(),
                timeZone: userTimeZone,
                allStoresCheck: false,
                status: 'COMPLETED_AND_ACTIVE',
                businessId: business.id,
                allStoreIds: [],
                stores: [store.id],
            };

            await StoreSettings.query()
                .patch({
                    timeZone: storeTimeZone,
                })
                .whereIn('storeId', [store.id]);

            const expectedResult = {
                paymentDate: momenttz(payment.updatedAt).tz(storeTimeZone).format('MM-DD-YYYY'),
                paymentTime: momenttz(payment.updatedAt).tz(storeTimeZone).format('hh:mm A'),
                orderLocation: store.address,
                orderId: serviceOrder.orderCode,
                customerName: `${storeCustomer.firstName} ${storeCustomer.lastName}`,
                customerPaid: serviceOrder.netOrderTotal,
                transactionFee: Number(Number(payment.transactionFee).toFixed()),
                fundsReceived: payment.totalAmount - payment.transactionFee,
                paymentMethod: payment.paymentProcessor,
                paymentEmployee: `${user.firstname} ${user.lastname}`,
            };

            transactionsReport.initialize(options);
            const report = await transactionsReport.getReportData();
            expect(report.length).to.equal(1);
            expect(report[0]).to.deep.equal(expectedResult);
        });

        describe('additional tests', () => {
            let store2, options, serviceOrder2, orderMaster2;
            beforeEach(async () => {
                store2 = await factory.create(FN.store, { businessId: business.id });
                serviceOrder2 = await factory.create(FN.serviceOrder, {
                    userId: user.id,
                    storeId: store2.id,
                    employeeCode: teamMember.id,
                    netOrderTotal: 0,
                    storeCustomerId: storeCustomer.id,
                    orderCode: '2222',
                    status: 'SUBMITTED',
                });
                orderMaster2 = await factory.create(FN.serviceOrderMasterOrder, {
                    orderableId: serviceOrder2.id,
                });
                await factory.create(FN.payment, {
                    orderId: orderMaster2.id,
                    storeId: store2.id,
                    status: 'succeeded',
                    createdAt: new Date('1-1-2021').toISOString(),
                    updatedAt: new Date('1-1-2021').toISOString(),
                });
                options = {
                    startDate: new Date('1-1-2020').toISOString(),
                    endDate: new Date().toISOString(),
                    timeZone: userTimeZone,
                    allStoresCheck: false,
                    status: 'COMPLETED_AND_ACTIVE',
                    stores: [store.id, store2.id],
                    businessId: business.id,
                    allStoreIds: [],
                };
                await StoreSettings.query()
                    .patch({
                        timeZone: storeTimeZone,
                    })
                    .whereIn('storeId', [store.id, store2.id]);
            });

            it('should return expected result', async () => {
                options.status = 'COMPLETED';
                transactionsReport.initialize(options);
                const report = await transactionsReport.getReportData();
                expect(report.length).to.equal(1);
                expect(report[0].orderId).to.equal(serviceOrder.orderCode);
            });

            it('should return expected result', async () => {
                options.allStoresCheck = true;
                options.allStoreIds = [store.id, store2.id];
                transactionsReport.initialize(options);
                const report = await transactionsReport.getReportData();
                expect(report.length).to.equal(2);
                expect(report[0].orderId).to.equal(serviceOrder.orderCode);
                expect(report[1].orderId).to.equal(serviceOrder2.orderCode);
            });

            it('should return expected result', async () => {
                options.status = 'ACTIVE';
                transactionsReport.initialize(options);
                const report = await transactionsReport.getReportData();
                expect(report.length).to.equal(1);
                expect(report[0].orderId).to.equal(serviceOrder2.orderCode);
            });

            it('should return expected result', async () => {
                options.status = 'SUBMITTED';
                transactionsReport.initialize(options);
                const report = await transactionsReport.getReportData();
                expect(report.length).to.equal(1);
                expect(report[0].orderId).to.equal(serviceOrder2.orderCode);
            });

            it('should return expected result', async () => {
                await factory.create(FN.payment, {
                    orderId: orderMaster2.id,
                    storeId: store2.id,
                    status: 'succeeded',
                    paymentProcessor: 'stripe',
                    createdAt: new Date('1-1-2021').toISOString(),
                    updatedAt: new Date('1-1-2021').toISOString(),
                });
                transactionsReport.initialize(options);
                const report = await transactionsReport.getReportData();
                expect(report.length).to.equal(2);
                expect(report[1].paymentMethod).to.includes('Cents');
            });
        });
    });
});

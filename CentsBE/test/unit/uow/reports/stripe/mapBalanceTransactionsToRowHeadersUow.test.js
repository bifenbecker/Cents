require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const {
    STRIPE_PAYOUT_BALANCE_TRANSACTION_RESPONSE,
    STRIPE_PAYMENT_BALANCE_TRANSACTION_RESPONSE,
} = require('../../../../constants/responseMocks');
const mapBalanceTransactionsToRowHeaders = require('../../../../../uow/reports/stripe/mapBalanceTransactionsToRowHeadersUow');
const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test mapBalanceTransactionsToRowHeaders uow', () => {
    let payload, store;
    beforeEach(async () => {
        payload = {
            options: {
                timeZone: 'America/Los_Angeles',
            },
            balanceTransactions: [
                {
                    ...STRIPE_PAYOUT_BALANCE_TRANSACTION_RESPONSE,
                },
                {
                    ...STRIPE_PAYMENT_BALANCE_TRANSACTION_RESPONSE,
                },
            ],
        };
        store = await factory.create(FN.store, {
            name: 'test store',
        });
    });
    it('should return finalReportData', async () => {
        const res = await mapBalanceTransactionsToRowHeaders(payload);
        expect(res).to.have.property('finalReportData');
        const expectedKeys = [
            'transferAmount',
            'createdAt',
            'arrivedAt',
            'customerPaidAmount',
            'toBePaidOut',
            'paymentDate',
            'orderCode',
            'storeName',
        ];
        expect(Object.keys(res.finalReportData[0])).to.deep.equal(expectedKeys);
    });

    it('should return formatted report data', async () => {
        const res = await mapBalanceTransactionsToRowHeaders(payload);
        expect(res).to.have.property('finalReportData');
        const reportData = [
            {
                transferAmount: 130.13,
                createdAt: '06-20-2022',
                arrivedAt: '06-20-2022',
                customerPaidAmount: '-',
                toBePaidOut: '-',
                paymentDate: '-',
                orderCode: '-',
                storeName: '-',
            },
            {
                transferAmount: '-',
                createdAt: '-',
                arrivedAt: '-',
                customerPaidAmount: 130.13,
                toBePaidOut: 130.13,
                paymentDate: '06-20-2022',
                orderCode: '-',
                storeName: '-',
            },
            {
                transferAmount:
                    '* Expected transfer dates listed above are an estimation, and may vary depending on the financial institutions involved.',
            },
        ];
        expect(res.finalReportData).to.be.an('array').of.length(3);
        expect(res.finalReportData).to.deep.eq(reportData);
    });

    it('should return service order code and store name for walkin order in the report', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            orderCode: '123',
            storeId: store.id,
        });
        const source = {
            source_transfer: {
                source_transaction: {
                    metadata: {
                        orderableId: serviceOrder.id,
                        orderableType: 'ServiceOrder',
                    },
                },
            },
        };
        const reportData = [
            {
                transferAmount: 130.13,
                createdAt: '06-20-2022',
                arrivedAt: '06-20-2022',
                customerPaidAmount: '-',
                toBePaidOut: '-',
                paymentDate: '-',
                orderCode: '-',
                storeName: '-',
            },
            {
                transferAmount: '-',
                createdAt: '-',
                arrivedAt: '-',
                customerPaidAmount: 130.13,
                toBePaidOut: 130.13,
                paymentDate: '06-20-2022',
                orderCode: 'WF-123',
                storeName: 'test store',
            },
            {
                transferAmount:
                    '* Expected transfer dates listed above are an estimation, and may vary depending on the financial institutions involved.',
            },
        ];
        payload.balanceTransactions[1].source = source;
        const res = await mapBalanceTransactionsToRowHeaders(payload);
        expect(res).to.have.property('finalReportData');
        expect(res.finalReportData).to.deep.eq(reportData);
    });

    it('should return service order code and store name for online order in the report', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            orderCode: '123',
            storeId: store.id,
            orderType: 'ONLINE',
        });
        const source = {
            source_transfer: {
                source_transaction: {
                    metadata: {
                        orderableId: serviceOrder.id,
                        orderableType: 'ServiceOrder',
                    },
                },
            },
        };
        const reportData = [
            {
                transferAmount: 130.13,
                createdAt: '06-20-2022',
                arrivedAt: '06-20-2022',
                customerPaidAmount: '-',
                toBePaidOut: '-',
                paymentDate: '-',
                orderCode: '-',
                storeName: '-',
            },
            {
                transferAmount: '-',
                createdAt: '-',
                arrivedAt: '-',
                customerPaidAmount: 130.13,
                toBePaidOut: 130.13,
                paymentDate: '06-20-2022',
                orderCode: 'DWF-123',
                storeName: 'test store',
            },
            {
                transferAmount:
                    '* Expected transfer dates listed above are an estimation, and may vary depending on the financial institutions involved.',
            },
        ];
        payload.balanceTransactions[1].source = source;
        const res = await mapBalanceTransactionsToRowHeaders(payload);
        expect(res).to.have.property('finalReportData');
        expect(res.finalReportData).to.deep.eq(reportData);
    });

    it('should return service order code and store name for residential order in the report', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            orderCode: '123',
            storeId: store.id,
            orderType: 'RESIDENTIAL',
        });
        const source = {
            source_transfer: {
                source_transaction: {
                    metadata: {
                        orderableId: serviceOrder.id,
                        orderableType: 'ServiceOrder',
                    },
                },
            },
        };
        const reportData = [
            {
                transferAmount: 130.13,
                createdAt: '06-20-2022',
                arrivedAt: '06-20-2022',
                customerPaidAmount: '-',
                toBePaidOut: '-',
                paymentDate: '-',
                orderCode: '-',
                storeName: '-',
            },
            {
                transferAmount: '-',
                createdAt: '-',
                arrivedAt: '-',
                customerPaidAmount: 130.13,
                toBePaidOut: 130.13,
                paymentDate: '06-20-2022',
                orderCode: 'RWF-123',
                storeName: 'test store',
            },
            {
                transferAmount:
                    '* Expected transfer dates listed above are an estimation, and may vary depending on the financial institutions involved.',
            },
        ];
        payload.balanceTransactions[1].source = source;
        const res = await mapBalanceTransactionsToRowHeaders(payload);
        expect(res).to.have.property('finalReportData');
        expect(res.finalReportData).to.deep.eq(reportData);
    });

    it('should return inventory order code and store name in the report', async () => {
        const inventoryOrder = await factory.create(FN.inventoryOrder, {
            orderCode: '123',
            storeId: store.id,
        });
        const source = {
            source_transfer: {
                source_transaction: {
                    metadata: {
                        orderableId: inventoryOrder.id,
                        orderableType: 'InventoryOrder',
                    },
                },
            },
        };
        const reportData = [
            {
                transferAmount: 130.13,
                createdAt: '06-20-2022',
                arrivedAt: '06-20-2022',
                customerPaidAmount: '-',
                toBePaidOut: '-',
                paymentDate: '-',
                orderCode: '-',
                storeName: '-',
            },
            {
                transferAmount: '-',
                createdAt: '-',
                arrivedAt: '-',
                customerPaidAmount: 130.13,
                toBePaidOut: 130.13,
                paymentDate: '06-20-2022',
                orderCode: 'INV-123',
                storeName: 'test store',
            },
            {
                transferAmount:
                    '* Expected transfer dates listed above are an estimation, and may vary depending on the financial institutions involved.',
            },
        ];
        payload.balanceTransactions[1].source = source;
        const res = await mapBalanceTransactionsToRowHeaders(payload);
        expect(res).to.have.property('finalReportData');
        expect(res.finalReportData).to.deep.eq(reportData);
    });
});

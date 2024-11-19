const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { generateToken } = require('../../../support/apiTestHelper');
const { assertGetResponseError,
    assertGetResponseSuccess
} = require('../../../support/httpRequestsHelper');
const { expect } = require('../../../support/chaiHelper');
const {
    paymentStatuses,
    statuses
} = require('../../../../constants/constants');
const StoreSettings = require('../../../../models/storeSettings');

const apiEndpoint = '/api/v1/business-owner/orders/invoicingCustomerOrdersReport';
const customerId = 1210;
const customerFirstName = 'Invoicing Report';
const customerLastName = 'Test Customer';

describe('test invoicingCustomerOrdersReport api', () => {
    let token, user, store, business, storeCustomer;

    beforeEach(async () => {
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
            userId: user.id,
        });
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        await StoreSettings.query()
            .patch({
                timeZone: 'America/Los_Angeles',
            })
            .where('storeId', store.id);
        token = generateToken({
            id: user.id,
        });

        const centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer, {id: customerId, firstName: customerFirstName, lastName: customerLastName});
        storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer,
            {
                centsCustomerId: centsCustomer.id,
                businessId: business.id,
                storeId: store.id,
            });
    });

    describe('user without owner/admin/manager role', () => {
        it('should fail if user without owner/admin/manager role tries to get the report', async () => {
            const user = await factory.create(FACTORIES_NAMES.user);
            token = generateToken({
                id: user.id,
            });

            const params = {
                startDate: '2022-08-09T12:59:32.582Z',
                endDate: '2022-08-12T12:59:32.582Z',
                timeZone: 'America/Los_Angeles',
                customerId: 1210,
            };

            await assertGetResponseError({
                url: apiEndpoint,
                params,
                token,
                code: 403,
                expectedError: 'Unauthorized',
            });
        });
    });

    describe('customer/business not found', () => {
        it('should fail if customer not found', async () => {
            const params = {
                startDate: '2022-08-09T12:59:32.582Z',
                endDate: '2022-08-12T12:59:32.582Z',
                timeZone: 'America/Los_Angeles',
                customerId: 12345,
            };

            await assertGetResponseError({
                url: apiEndpoint,
                params,
                token,
                code: 400,
                expectedError: 'Customer for the selected stores was not found',
            });
        });

        it('should fail if business not found', async () => {
            const user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
            token = generateToken({
                id: user.id,
            });

            const params = {
                startDate: '2022-08-09T12:59:32.582Z',
                endDate: '2022-08-12T12:59:32.582Z',
                timeZone: 'America/Los_Angeles',
                customerId: customerId,
            };

            await assertGetResponseError({
                url: apiEndpoint,
                params,
                token,
                code: 400,
                expectedError: 'Invalid request. No business exists',
            });
        });

        it('should respond 422 if start date not passed', async () => {
            const params = {
                endDate: '2022-08-12T12:59:32.582Z',
                timeZone: 'America/Los_Angeles',
                customerId: customerId,
            };

            await assertGetResponseError({
                url: apiEndpoint,
                params,
                token,
                code: 422,
                expectedError: '"startDate" is required',
            });
        });
    });

    describe('inventory orders', () => {
        beforeEach(async () => {
            const inventoryOrder = await factory.create(FACTORIES_NAMES.inventoryOrder, {
                storeId: store.id,
                status: statuses.COMPLETED,
                paymentStatus: paymentStatuses.INVOICING,
                storeCustomerId: storeCustomer.id,
                createdAt: '2022-08-10T12:59:32.582Z',
                netOrderTotal: 0,
                orderCode: '123',
                orderTotal: 10.99,
            });

            await factory.create(FACTORIES_NAMES.order, {
                storeId: store.id,
                orderableId: inventoryOrder.id,
                orderableType: 'InventoryOrder',
            });
        })

        it('should extract invoicing orders', async () => {
            const params = {
                startDate: '2022-08-09T12:59:32.582Z',
                endDate: '2022-08-12T12:59:32.582Z',
                timeZone: 'America/Los_Angeles',
                customerId: 1210,
            };

            const { body } = await assertGetResponseSuccess({
                url: apiEndpoint,
                params,
                token,
            });

            expect(body).to.have.property('success', true);
            expect(body).to.have.property('orders').to.be.an('array').to.have.length(1);

            const order = body.orders[0];

            expect(order).to.have.property('Invoice Number').to.be.empty;
            expect(order).to.have.property('Due Date').to.be.empty;
            expect(order).to.have.property('Item').to.be.equal('Services');
            expect(order).to.have.property('Invoice Date').not.to.be.empty;
            expect(order).to.have.property('Customer Name').to.equal(`${customerFirstName} ${customerLastName}`);
            expect(order).to.have.property('Service Date').not.to.be.empty;
            expect(order).to.have.property('Item Description').to.equal('INV-123');
            expect(order).to.have.property('Item Amount').to.equal(10.99);
        });
    });

    describe('service orders', () => {
        describe('extract orders', () => {
            beforeEach(async () => {
                const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
                    storeId: store.id,
                    status: statuses.COMPLETED,
                    paymentStatus: paymentStatuses.INVOICING,
                    storeCustomerId: storeCustomer.id,
                    placedAt: '2022-08-10T12:59:32.582Z',
                    netOrderTotal: 0,
                    orderCode: '123',
                    orderTotal: 10.99,
                });

                await factory.create(FACTORIES_NAMES.order, {
                    storeId: store.id,
                    orderableId: serviceOrder.id,
                    orderableType: 'ServiceOrder',
                });
            })

            it('get invoicing orders', async () => {
                const params = {
                    startDate: '2022-08-09T12:59:32.582Z',
                    endDate: '2022-08-12T12:59:32.582Z',
                    timeZone: 'America/Los_Angeles',
                    customerId: 1210,
                };

                const { body } = await assertGetResponseSuccess({
                    url: apiEndpoint,
                    params,
                    token,
                });

                expect(body).to.have.property('success', true);
                expect(body).to.have.property('orders').to.be.an('array').to.have.length(1);

                const order = body.orders[0];

                expect(order).to.have.property('Invoice Number').to.be.empty;
                expect(order).to.have.property('Due Date').to.be.empty;
                expect(order).to.have.property('Item').to.be.equal('Services');
                expect(order).to.have.property('Invoice Date').not.to.be.empty;
                expect(order).to.have.property('Customer Name').to.equal(`${customerFirstName} ${customerLastName}`);
                expect(order).to.have.property('Service Date').not.to.be.empty;
                expect(order).to.have.property('Item Description').to.equal('WF-123');
                expect(order).to.have.property('Item Amount').to.equal(10.99);
            });
        });

        describe('should not extract orders', () => {
            it('with other payment status', async () => {
                const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
                    storeId: store.id,
                    status: statuses.COMPLETED,
                    paymentStatus: paymentStatuses.PAID,
                    storeCustomerId: storeCustomer.id,
                    placedAt: '2022-08-10T12:59:32.582Z',
                    netOrderTotal: 0,
                    orderCode: '123',
                    orderTotal: 10.99,
                });

                await factory.create(FACTORIES_NAMES.order, {
                    storeId: store.id,
                    orderableId: serviceOrder.id,
                    orderableType: 'ServiceOrder',
                });

                const params = {
                    startDate: '2022-08-09T12:59:32.582Z',
                    endDate: '2022-08-12T12:59:32.582Z',
                    timeZone: 'America/Los_Angeles',
                    customerId: 1210,
                };

                const { body } = await assertGetResponseSuccess({
                    url: apiEndpoint,
                    params,
                    token,
                });

                expect(body).to.have.property('success', true);
                expect(body).to.have.property('orders').to.be.an('array').to.be.empty;
            });

            it('with other order status', async () => {
                const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
                    storeId: store.id,
                    status: statuses.CANCELLED,
                    paymentStatus: paymentStatuses.INVOICING,
                    storeCustomerId: storeCustomer.id,
                    placedAt: '2022-08-10T12:59:32.582Z',
                    netOrderTotal: 0,
                    orderCode: '123',
                    orderTotal: 10.99,
                });

                await factory.create(FACTORIES_NAMES.order, {
                    storeId: store.id,
                    orderableId: serviceOrder.id,
                    orderableType: 'ServiceOrder',
                });

                const params = {
                    startDate: '2022-08-09T12:59:32.582Z',
                    endDate: '2022-08-12T12:59:32.582Z',
                    timeZone: 'America/Los_Angeles',
                    customerId: 1210,
                };

                const { body } = await assertGetResponseSuccess({
                    url: apiEndpoint,
                    params,
                    token,
                });

                expect(body).to.have.property('success', true);
                expect(body).to.have.property('orders').to.be.an('array').to.be.empty;
            });

            it('outside date range', async () => {
                const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
                    storeId: store.id,
                    status: statuses.COMPLETED,
                    paymentStatus: paymentStatuses.INVOICING,
                    storeCustomerId: storeCustomer.id,
                    placedAt: '2022-07-10T12:59:32.582Z',
                    netOrderTotal: 0,
                    orderCode: '123',
                    orderTotal: 10.99,
                });

                await factory.create(FACTORIES_NAMES.order, {
                    storeId: store.id,
                    orderableId: serviceOrder.id,
                    orderableType: 'ServiceOrder',
                });

                const params = {
                    startDate: '2022-08-09T12:59:32.582Z',
                    endDate: '2022-08-12T12:59:32.582Z',
                    timeZone: 'America/Los_Angeles',
                    customerId: 1210,
                };

                const { body } = await assertGetResponseSuccess({
                    url: apiEndpoint,
                    params,
                    token,
                });

                expect(body).to.have.property('success', true);
                expect(body).to.have.property('orders').to.be.an('array').to.be.empty;
            });
        });
    })
});

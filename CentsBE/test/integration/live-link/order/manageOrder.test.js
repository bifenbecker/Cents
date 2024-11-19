require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const {
    generateLiveLinkCustomerToken,
    generateLiveLinkOrderToken,
} = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { StoreSchema } = require('../../../../elasticsearch/store/schema');
const { reindexStoresData } = require('../../../../elasticsearch/store/reindexData');
const serviceOrders = require('../../../../models/serviceOrders');
const ownDeliverySettings = require('../../../../models/ownDeliverySettings');
const { deliveryProviders } = require('../../../../constants/constants');

const API_ENDPOINT = '/api/v1/live-status/live-link/manage';

describe('test manageOrder API', async () => {
    let business,
        store,
        centsCustomer,
        centsCustomerAddress,
        order,
        orderDeliveryPickup,
        timing,
        storeCustomer,
        serviceOrder,
        token,
        validOrderToken;

    before(async () => {
        await StoreSchema();
    });

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');

        store = await factory.create('store', {
            businessId: business.id,
        });

        await factory.create('ownDeliverySetting', {
            storeId: store.id,
            deliveryFeeInCents: 500,
        });

        centsCustomer = await factory.create('centsCustomer');
        centsCustomerAddress = await factory.create('centsCustomerAddress', {
            centsCustomerId: centsCustomer.id,
        });
        storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
        });

        serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
            status: 'READY_FOR_PROCESSING',
            storeCustomerId: storeCustomer.id,
        });

        order = await factory.create('order', {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        timing = await factory.create('timing');
        orderDeliveryPickup = await factory.create('orderDelivery', {
            status: 'SCHEDULED',
            orderId: order.id,
            storeId: serviceOrder.storeId,
            deliveryProvider: 'OWN_DELIVERY',
            type: 'PICKUP',
        });

        token = generateLiveLinkCustomerToken({ id: centsCustomer.id });
        validOrderToken = generateLiveLinkOrderToken({ id: serviceOrder.id });

        await reindexStoresData();
    });

    describe('when auth token validation fails', () => {
        it('should respond with a 401 code when token is empty', async () => {
            const orderToken = generateLiveLinkOrderToken({ id: serviceOrder.id });

            const params = {
                token: orderToken,
            };

            const res = await ChaiHttpRequestHepler.put(API_ENDPOINT, params, {});
            res.should.have.status(401);
            res.body.error.should.equal('customerauthtoken is required.');
        });

        it('should respond with a 404 when customerauthtoken is invalid', async () => {
            const orderToken = generateLiveLinkOrderToken({ id: serviceOrder.id });

            const params = {
                token: orderToken,
            };

            const token = generateLiveLinkCustomerToken({ id: 100 });
            const res = await ChaiHttpRequestHepler.put(API_ENDPOINT, params, {}).set(
                'customerauthtoken',
                token,
            );
            res.should.have.status(401);
            res.body.error.should.equal(
                'Order is not associated with you. Please re-request the otp to continue.',
            );
        });

        it('should respond with a 401 when order token is invalid', async () => {
            const orderToken = generateLiveLinkOrderToken({ id: 42 });

            const params = {
                token: orderToken,
            };

            const token = generateLiveLinkCustomerToken({ id: centsCustomer.id });
            const res = await ChaiHttpRequestHepler.put(API_ENDPOINT, params, {}).set(
                'customerauthtoken',
                token,
            );
            res.should.have.status(401);
            res.body.error.should.equal(
                'Order is not associated with you. Please re-request the otp to continue.',
            );
        });
    });

    describe('when auth token is valid', () => {
        describe('when payload is invalid', () => {
            it('should respond with a 422 code when a property is not expected', async () => {
                const body = {
                    id: serviceOrder.id,
                    customerNotes: 'here are customer notes',
                    orderNotes: 'here are order notes',
                    returnMethod: 'this is the return method',
                    isHangDrySelected: true,
                };
                const params = {
                    token: validOrderToken,
                    storeId: store.id,
                };
                const res = await ChaiHttpRequestHepler.put(API_ENDPOINT, params, body).set(
                    'customerauthtoken',
                    token,
                );

                res.should.have.status(422);
                res.body.error.should.equal('"isHangDrySelected" is not allowed');
            });

            it('should respond with a 422 code when a property is not provided', async () => {
                const body = {
                    id: serviceOrder.id,
                    customerNotes: 'here are customer notes',
                    returnMethod: 'this is the return method',
                };
                const params = {
                    token: validOrderToken,
                    storeId: store.id,
                };
                const res = await ChaiHttpRequestHepler.put(API_ENDPOINT, params, body).set(
                    'customerauthtoken',
                    token,
                );

                res.should.have.status(422);
                res.body.error.should.equal('orderNotes is required.');
            });
        });

        describe('when payload is valid', () => {
            it('should update order successfully when all values are provided', async () => {
                const body = {
                    id: serviceOrder.id,
                    customerNotes: 'here are customer notes',
                    orderNotes: 'here are some NEW order notes',
                    returnMethod: 'DELIVERY',
                };
                const params = {
                    token: validOrderToken,
                    storeId: store.id,
                };
                const res = await ChaiHttpRequestHepler.put(API_ENDPOINT, params, body).set(
                    'customerauthtoken',
                    token,
                );

                res.should.have.status(200);

                const orderAfterUpdate = await serviceOrders.query().findById(serviceOrder.id);

                expect(res.body.orderNotes).to.deep.equal(orderAfterUpdate.orderNotes);
                expect(res.body.customerNotes).to.deep.equal(orderAfterUpdate.customerNotes);
            });

            it('should compute delivery fee for own driver pickup', async () => {
                const body = {
                    id: serviceOrder.id,
                    customerNotes: 'here are customer notes',
                    orderNotes: 'here are some NEW order notes',
                    returnMethod: '',
                    orderDelivery: {
                        pickup: {
                            id: orderDeliveryPickup.id,
                            centsCustomerAddressId: centsCustomerAddress.id,
                            type: 'PICKUP',
                            timingsId: timing.id,
                            deliveryProvider: deliveryProviders.OWN_DRIVER,
                            deliveryWindow: [1, 2],
                            totalDeliveryCost: 100,
                            thirdPartyDeliveryId: null,
                            thirdPartyDeliveryCostInCents: null,
                            courierTip: 0,
                            subsidyInCents: 0,
                        },
                    },
                };
                const params = {
                    token: validOrderToken,
                    storeId: store.id,
                };
                const res = await ChaiHttpRequestHepler.put(API_ENDPOINT, params, body).set(
                    'customerauthtoken',
                    token,
                );

                res.should.have.status(200);
                const orderAfterUpdate = await serviceOrders.query().findById(serviceOrder.id);
                const deliverySettings = await ownDeliverySettings
                    .query()
                    .findOne({ storeId: orderAfterUpdate.storeId });
                const expectedDeliveryFee = deliverySettings.deliveryFeeInCents / 100 / 2;

                expect(orderAfterUpdate.pickupDeliveryFee).to.equal(expectedDeliveryFee);
            });

            it('should compute delivery fee for own driver return', async () => {
                await factory.create('creditReason');
                const orderDeliveryReturn = await factory.create('orderDelivery', {
                    status: 'SCHEDULED',
                    orderId: order.id,
                    storeId: serviceOrder.storeId,
                    deliveryProvider: 'OWN_DELIVERY',
                    type: 'RETURN',
                });

                const body = {
                    id: serviceOrder.id,
                    customerNotes: 'here are customer notes',
                    orderNotes: 'here are some NEW order notes',
                    returnMethod: 'DELIVERY',
                    orderDelivery: {
                        return: {
                            id: orderDeliveryReturn.id,
                            centsCustomerAddressId: orderDeliveryReturn.centsCustomerAddressId,
                            type: 'RETURN',
                            timingsId: orderDeliveryReturn.timingsId,
                            deliveryProvider: deliveryProviders.OWN_DRIVER,
                            deliveryWindow: orderDeliveryReturn.deliveryWindow,
                            totalDeliveryCost: 100,
                            thirdPartyDeliveryId: null,
                            thirdPartyDeliveryCostInCents: null,
                            courierTip: 0,
                            subsidyInCents: 0,
                        },
                    },
                };
                const params = {
                    token: validOrderToken,
                    storeId: store.id,
                };
                const res = await ChaiHttpRequestHepler.put(API_ENDPOINT, params, body).set(
                    'customerauthtoken',
                    token,
                );

                res.should.have.status(200);
                const orderAfterUpdate = await serviceOrders.query().findById(serviceOrder.id);
                expect(orderAfterUpdate.returnDeliveryFee).to.equal(2.5);
            });
        });
    });
});

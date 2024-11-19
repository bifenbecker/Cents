require('../../testHelper');
const sinon = require('sinon');
const nock = require('nock');
const { sum } = require('lodash');
const factory = require('../../factories');
const { expect } = require('../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const { getCreateOrderReq } = require('../../support/requestCreators/getCreateOrderReq');
const createOnlineOrderPipeline = require('../../../pipeline/pickup/createOnlineOrder');
const Pipeline = require('../../../pipeline/pipeline');
const StripePayment = require('../../../services/stripe/stripePayment');
const JwtService = require('../../../services/tokenOperations/main');
const stripe = require('../../../stripe/stripeWithSecret');
const StoreSettings = require('../../../models/storeSettings');
const ServiceOrder = require('../../../models/serviceOrders');
const Payment = require('../../../models/payment');
const OrderDelivery = require('../../../models/orderDelivery');
const eventEmitter = require('../../../config/eventEmitter');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const { CREATE_STRIPE_INTENT_RESPONSE } = require('../../constants/responseMocks');
const {
    locationType,
    deliveryProviders,
    returnMethods,
    ORDER_DELIVERY_TYPES,
} = require('../../../constants/constants');
const { MAX_DB_INTEGER } = require('../../constants/dbValues');

const apiEndpoint = '/api/v1/live-status/stores/:storeId/order';
const thirdPartyDeliveryId = MAX_DB_INTEGER;
const orderNotes = 'Notes by user';
const pickupCourierTip = 5;
const returnCourierTip = 9;

describe(`test ${apiEndpoint} API endpoint`, () => {
    const prepareReq = async ({
        businessCustomer: businessCustomerAttrs,
        store: storeAttrs,
        pickup: pickupAttrs,
        return: returnAttrs,
        servicePrice: servicePriceAttrs,
    } = {}) => {
        const {
            entities: {
                store,
                centsCustomer,
                storeCustomer,
                serviceOrder,
                laundromatBusiness,
                centsCustomerAddress,
                storeSettings,
            },
            req: { body },
        } = await getCreateOrderReq({
            businessCustomer: businessCustomerAttrs,
            store: storeAttrs,
            pickup: pickupAttrs,
            return: returnAttrs,
            servicePrice: servicePriceAttrs,
            pickupCourierTip,
            returnCourierTip,
        });

        const jwtService = new JwtService(JSON.stringify({ id: centsCustomer.id }));
        const customerauthtoken = jwtService.tokenGenerator(
            process.env.JWT_SECRET_LIVE_LINK_CUSTOMER,
        );

        const stripeRetrieve = sinon
            .stub(StripePayment.prototype, 'retrievePaymentMethod')
            .returns({ type: 'card' });
        const stripeAttach = sinon.stub(stripe.paymentMethods, 'attach');
        const stripeCreateIntent = sinon
            .stub(StripePayment, 'createPaymentIntent')
            .callsFake((arg) => Object.assign(CREATE_STRIPE_INTENT_RESPONSE, arg));
        const doorDashValidation = nock(process.env.DOORDASH_API_URL)
            .post('/validations')
            .reply(200, {});
        const doorDashDeliveries = nock(process.env.DOORDASH_API_URL)
            .post('/deliveries')
            .reply(200, {
                id: thirdPartyDeliveryId,
                fee: 5,
                delivery_tracking_url: 'delivery_url',
            });
        const doorDashCancel = nock(process.env.DOORDASH_API_URL)
            .put(`/deliveries/${thirdPartyDeliveryId}/cancel`)
            .reply(200, {});

        return {
            body: { ...body, orderNotes },
            store,
            storeSettings,
            centsCustomer,
            centsCustomerAddress,
            storeCustomer,
            serviceOrder,
            laundromatBusiness,
            customerauthtoken,
            stripeRetrieve,
            stripeAttach,
            stripeCreateIntent,
            doorDashValidation,
            doorDashDeliveries,
            doorDashCancel,
        };
    };

    const filterDoorDashPickUp = (orderDeliveries) =>
        orderDeliveries.filter(
            (delivery) =>
                delivery.deliveryProvider === deliveryProviders.DOORDASH &&
                delivery.type === ORDER_DELIVERY_TYPES.PICKUP,
        );
    const filterDoorDashReturn = (orderDeliveries) =>
        orderDeliveries.filter(
            (delivery) =>
                delivery.deliveryProvider === deliveryProviders.DOORDASH &&
                delivery.type === ORDER_DELIVERY_TYPES.RETURN,
        );

    afterEach(() => {
        nock.cleanAll();
        sinon.restore();
    });

    describe('should response token order', () => {
        const defaultAssert = async ({
            response,
            storeId,
            storeCustomer,
            stripeRetrieve,
            stripeAttach,
            stripeCreateIntent,
            doorDashCancel,
        }) => {
            response.should.have.status(200);
            expect(response.body).have.property('success').equal(true);
            expect(response.body).have.property('order');

            const jwtService = new JwtService(response.body.order);
            const { id: serviceOrderId } = jwtService.verifyToken(
                process.env.JWT_SECRET_TOKEN_ORDER,
            );
            const serviceOrder = await ServiceOrder.query()
                .where({
                    storeId,
                    notes: orderNotes,
                })
                .returning('*')
                .first();
            expect(serviceOrderId, 'should return token with correct serviceOrder id').equal(
                serviceOrder.id,
            );
            expect(serviceOrder.notes, 'should create serviceOrder').equal(orderNotes);

            const payment = await Payment.query()
                .where({
                    storeId,
                    storeCustomerId: storeCustomer.id,
                })
                .returning('*')
                .first();
            expect(payment, 'should create payment').to.be.an('object').to.not.be.empty;
            expect(stripeRetrieve.called, 'should call stripe retrieve').to.be.true;
            expect(stripeAttach.called, 'should call stripe attach').to.be.true;
            expect(stripeCreateIntent.called, 'should call stripe create intent').to.be.true;
            expect(doorDashCancel.isDone(), 'should call doorDash cancel').to.be.false;

            return { serviceOrder };
        };

        describe('with BY_OWN delivery', async () => {
            it('without commercialTierId and hubId', async () => {
                const {
                    body,
                    body: { storeId },
                    customerauthtoken,
                    storeCustomer,
                    stripeRetrieve,
                    stripeAttach,
                    stripeCreateIntent,
                    doorDashValidation,
                    doorDashDeliveries,
                    doorDashCancel,
                } = await prepareReq();
                const spy = sinon.spy();
                eventEmitter.on('doorDashOrderSubmitted', spy);

                // request
                const response = await ChaiHttpRequestHelper.post(
                    apiEndpoint.replace(':storeId', storeId),
                    {},
                    body,
                ).set({ customerauthtoken });

                // assert
                const { serviceOrder } = await defaultAssert({
                    response,
                    storeId,
                    storeCustomer,
                    stripeRetrieve,
                    stripeAttach,
                    stripeCreateIntent,
                    doorDashCancel,
                });
                expect(doorDashValidation.isDone(), 'should not call doorDash validation').to.be
                    .false;
                expect(doorDashDeliveries.isDone(), 'should not call doorDash deliveries').to.be
                    .false;
                expect(serviceOrder.isProcessedAtHub, 'should processed at hub').to.be.false;
                expect(serviceOrder.hubId, 'should have hubId').to.be.null;
                expect(spy.called, 'should emit doorDashOrderSubmitted').to.be.false;
            });

            describe('with commercialTierId and hubId', async () => {
                const itemsTotal = 10;

                it('with special price', async () => {
                    const commercialDeliveryFeeInCents = -300;
                    const hubStore = await factory.create(FN.store, { isHub: true });
                    const pricingTier = await factory.create(FN.pricingTier, {
                        commercialDeliveryFeeInCents,
                    });
                    const {
                        body,
                        customerauthtoken,
                        body: { storeId },
                        storeCustomer,
                        stripeRetrieve,
                        stripeAttach,
                        stripeCreateIntent,
                        doorDashValidation,
                        doorDashDeliveries,
                        doorDashCancel,
                    } = await prepareReq({
                        businessCustomer: {
                            isCommercial: true,
                            commercialTierId: pricingTier.id,
                        },
                        store: {
                            type: locationType.INTAKE_ONLY,
                            hubId: hubStore.id,
                        },
                        servicePrice: {
                            pricingTierId: pricingTier.id,
                        },
                    });
                    const spy = sinon.spy();
                    eventEmitter.on('doorDashOrderSubmitted', spy);

                    // request
                    const response = await ChaiHttpRequestHelper.post(
                        apiEndpoint.replace(':storeId', storeId),
                        {},
                        body,
                    ).set({ customerauthtoken });

                    // assert
                    const { serviceOrder } = await defaultAssert({
                        response,
                        storeId,
                        storeCustomer,
                        stripeRetrieve,
                        stripeAttach,
                        stripeCreateIntent,
                        doorDashCancel,
                    });
                    expect(doorDashValidation.isDone(), 'should not call doorDash validation').to.be
                        .false;
                    expect(doorDashDeliveries.isDone(), 'should not call doorDash deliveries').to.be
                        .false;
                    expect(serviceOrder.isProcessedAtHub, 'should processed at hub').to.be.true;
                    expect(serviceOrder.hubId, 'should have hubId').equal(hubStore.id);
                    expect(serviceOrder.tierId, 'should have correct tierId').equal(pricingTier.id);
                    expect(spy.called, 'should emit doorDashOrderSubmitted').to.be.false;

                    const expectedTotal = sum([
                        itemsTotal,
                        pickupCourierTip,
                        returnCourierTip,
                        commercialDeliveryFeeInCents / 100,
                    ]);
                    expect(serviceOrder.netOrderTotal, 'should calculate correct total').equal(
                        expectedTotal,
                    );
                });

                it('no price privileges', async () => {
                    const commercialDeliveryFeeInCents = null;
                    const hubStore = await factory.create(FN.store, { isHub: true });
                    const pricingTier = await factory.create(FN.pricingTier, {
                        commercialDeliveryFeeInCents,
                    });
                    const {
                        body,
                        customerauthtoken,
                        body: { storeId },
                        storeCustomer,
                        stripeRetrieve,
                        stripeAttach,
                        stripeCreateIntent,
                        doorDashValidation,
                        doorDashDeliveries,
                        doorDashCancel,
                    } = await prepareReq({
                        businessCustomer: {
                            isCommercial: true,
                            commercialTierId: pricingTier.id,
                        },
                        store: {
                            type: locationType.INTAKE_ONLY,
                            hubId: hubStore.id,
                        },
                        servicePrice: {
                            pricingTierId: pricingTier.id,
                        },
                    });
                    const spy = sinon.spy();
                    eventEmitter.on('doorDashOrderSubmitted', spy);

                    // request
                    const response = await ChaiHttpRequestHelper.post(
                        apiEndpoint.replace(':storeId', storeId),
                        {},
                        body,
                    ).set({ customerauthtoken });

                    // assert
                    const { serviceOrder } = await defaultAssert({
                        response,
                        storeId,
                        storeCustomer,
                        stripeRetrieve,
                        stripeAttach,
                        stripeCreateIntent,
                        doorDashCancel,
                    });
                    expect(doorDashValidation.isDone(), 'should not call doorDash validation').to.be
                        .false;
                    expect(doorDashDeliveries.isDone(), 'should not call doorDash deliveries').to.be
                        .false;
                    expect(serviceOrder.isProcessedAtHub, 'should processed at hub').to.be.true;
                    expect(serviceOrder.hubId, 'should have hubId').equal(hubStore.id);
                    expect(serviceOrder.tierId, 'should have correct tierId').equal(pricingTier.id);
                    expect(spy.called, 'should emit doorDashOrderSubmitted').to.be.false;

                    const expectedTotal = sum([itemsTotal, pickupCourierTip, returnCourierTip]);
                    expect(serviceOrder.netOrderTotal, 'should calculate correct total').equal(
                        expectedTotal,
                    );
                });
            });
        });

        it('with DOORDASH delivery', async () => {
            const {
                body,
                customerauthtoken,
                body: { storeId },
                storeCustomer,
                stripeRetrieve,
                stripeAttach,
                stripeCreateIntent,
                doorDashValidation,
                doorDashDeliveries,
                doorDashCancel,
            } = await prepareReq({
                pickup: {
                    deliveryProvider: deliveryProviders.DOORDASH,
                },
                return: {
                    deliveryProvider: deliveryProviders.DOORDASH,
                },
            });
            const spy = sinon.spy();
            eventEmitter.on('doorDashOrderSubmitted', spy);

            // request
            const response = await ChaiHttpRequestHelper.post(
                apiEndpoint.replace(':storeId', storeId),
                {},
                body,
            ).set({ customerauthtoken });

            // assert
            await defaultAssert({
                response,
                storeId,
                storeCustomer,
                stripeRetrieve,
                stripeAttach,
                stripeCreateIntent,
                doorDashCancel,
            });
            expect(doorDashValidation.isDone(), 'should call doorDash validation').to.be.true;
            expect(doorDashDeliveries.isDone(), 'should call doorDash deliveries').to.be.true;
            expect(spy.called, 'should emit doorDashOrderSubmitted').to.be.true;
            const orderDeliveries = await OrderDelivery.query()
                .where({
                    storeId,
                })
                .returning('*');
            expect(orderDeliveries, 'should create pickUp and return orderDeliveries')
                .to.be.an('array')
                .lengthOf(2);
            expect(filterDoorDashPickUp(orderDeliveries)).to.be.an('array').lengthOf(1);
            expect(filterDoorDashReturn(orderDeliveries)).to.be.an('array').lengthOf(1);
        });

        it('without return delivery', async () => {
            const {
                body,
                customerauthtoken,
                body: { storeId },
                storeCustomer,
                stripeRetrieve,
                stripeAttach,
                stripeCreateIntent,
                doorDashCancel,
                doorDashValidation,
                doorDashDeliveries,
            } = await prepareReq({
                pickup: {
                    deliveryProvider: deliveryProviders.DOORDASH,
                },
            });
            body.returnMethod = returnMethods.IN_STORE_PICKUP;
            body.orderDelivery.delivery = {};

            // request
            const response = await ChaiHttpRequestHelper.post(
                apiEndpoint.replace(':storeId', storeId),
                {},
                body,
            ).set({ customerauthtoken });

            // assert
            await defaultAssert({
                response,
                storeId,
                storeCustomer,
                stripeRetrieve,
                stripeAttach,
                stripeCreateIntent,
                doorDashCancel,
            });
            expect(doorDashValidation.isDone(), 'should call doorDash validation').to.be.true;
            expect(doorDashDeliveries.isDone(), 'should call doorDash deliveries').to.be.true;
            const orderDeliveries = await OrderDelivery.query()
                .where({
                    storeId,
                })
                .returning('*');
            expect(orderDeliveries, 'should create only 1 orderDelivery')
                .to.be.an('array')
                .lengthOf(1);
            expect(filterDoorDashPickUp(orderDeliveries), 'should create only pickup orderDelivery')
                .to.be.an('array')
                .lengthOf(1);
        });
    });

    describe('with mocked createOnlineOrderPipeline', () => {
        describe('without storeSettings', () => {
            it('should emit with UTC timezone by default and call pipeline', async () => {
                const stubbedPipelineRun = sinon.stub(Pipeline.prototype, 'run').callsFake(() => ({
                    intentCreatedDelivery: {},
                    store: {},
                    serviceOrder: {},
                    orderDelivery: {
                        pickup: {},
                    },
                }));

                const {
                    body,
                    body: { storeId },
                } = await prepareReq();
                await StoreSettings.query().delete().where({ storeId });

                const spy = sinon.spy();
                eventEmitter.on('intentCreatedOrderDelivery', spy);

                // call pipeline
                await createOnlineOrderPipeline(body);

                // assert
                expect(stubbedPipelineRun.called, 'should run pipeline').to.be.true;
                expect(spy.called, 'should emit intentCreatedOrderDelivery').to.be.true;
                expect(
                    spy.firstCall.args[0].storeTimezone,
                    'should emit intentCreatedOrderDelivery',
                ).equal('UTC');
            });

            it('should emit with output.store.settings.timeZone and call pipeline', async () => {
                const timeZone = 'UTC +5';
                const stubbedPipelineRun = sinon.stub(Pipeline.prototype, 'run').callsFake(() => ({
                    intentCreatedDelivery: {},
                    store: {},
                    serviceOrder: {},
                    orderDelivery: {
                        pickup: {},
                    },
                    settings: {
                        timeZone,
                    },
                }));

                const { body } = await prepareReq();

                const spy = sinon.spy();
                eventEmitter.on('intentCreatedOrderDelivery', spy);

                // call pipeline
                await createOnlineOrderPipeline(body);

                // assert
                expect(stubbedPipelineRun.called, 'should run pipeline').to.be.true;
                expect(spy.called, 'should emit intentCreatedOrderDelivery').to.be.true;
                expect(
                    spy.firstCall.args[0].storeTimezone,
                    'should emit intentCreatedOrderDelivery',
                ).equal(timeZone);
            });
        });

        describe('with storeSettings', () => {
            it('should emit output.settings.timeZone', async () => {
                const {
                    body,
                    laundromatBusiness,
                    centsCustomer,
                    store,
                    centsCustomerAddress,
                    storeSettings,
                } = await prepareReq();

                const spy = sinon.spy();
                eventEmitter.on('intentCreatedOrderDelivery', spy);

                // call pipeline
                await createOnlineOrderPipeline({
                    address: centsCustomerAddress,
                    store: {
                        ...store,
                        settings: storeSettings,
                    },
                    centsCustomer,
                    businessId: laundromatBusiness.id,
                    settings: storeSettings,
                    ...body,
                });

                // assert
                expect(spy.called, 'should emit intentCreatedOrderDelivery').to.be.true;
                expect(
                    spy.firstCall.args[0].storeTimezone,
                    'should emit intentCreatedOrderDelivery',
                ).equal(null);
            });
        });
    });

    describe('should throw Error', () => {
        const apiError = 'apiError';

        describe('with pickup', () => {
            it('should cancel DoorDashDelivery', async () => {
                const {
                    body,
                    customerauthtoken,
                    body: { storeId },
                    doorDashCancel,
                } = await prepareReq({
                    pickup: {
                        deliveryProvider: deliveryProviders.DOORDASH,
                        thirdPartyDeliveryId,
                    },
                });
                body.returnMethod = returnMethods.IN_STORE_PICKUP;
                StripePayment.createPaymentIntent.restore();
                sinon.stub(StripePayment, 'createPaymentIntent').throws(apiError);

                // request
                const response = await ChaiHttpRequestHelper.post(
                    apiEndpoint.replace(':storeId', storeId),
                    {},
                    body,
                ).set({ customerauthtoken });

                // assert
                response.should.have.status(500);
                expect(doorDashCancel.isDone(), 'should cancel doorDash pickUp').to.be.true;
            });
        });

        it('without pickup', async () => {
            const {
                body,
                customerauthtoken,
                body: { storeId },
                doorDashCancel,
            } = await prepareReq();
            body.returnMethod = returnMethods.IN_STORE_PICKUP;
            StripePayment.createPaymentIntent.restore();
            sinon.stub(StripePayment, 'createPaymentIntent').throws(apiError);

            // request
            const response = await ChaiHttpRequestHelper.post(
                apiEndpoint.replace(':storeId', storeId),
                {},
                body,
            ).set({ customerauthtoken });

            // assert
            response.should.have.status(500);
            expect(doorDashCancel.isDone(), 'should not cancel doorDash pickUp').to.be.false;
        });
    });
});

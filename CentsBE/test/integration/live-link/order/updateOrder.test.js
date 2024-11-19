require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const {
    createOrderAndCustomerTokensWithRelations,
} = require('../../../support/createOrderAndCustomerTokensHelper');
const {
    endpointPipelineMock,
    endpointPipelineErrorMock,
} = require('../../../support/pipelineTestHelper');
const {
    generateLiveLinkOrderToken,
    generateLiveLinkCustomerToken,
} = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const ServiceOrder = require('../../../../models/serviceOrders');
const Store = require('../../../../models/store');
const StoreSettings = require('../../../../models/storeSettings');
const StoreCustomer = require('../../../../models/storeCustomer');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const {
    ORDER_TYPES,
    ORDER_DELIVERY_TYPES,
    orderDeliveryStatuses,
    statuses,
} = require('../../../../constants/constants');

const apiEndpoint = '/api/v1/live-status';
const tipApiEndpoint = '/api/v1/live-status/tip';

const addPromotionApiEndpoint = '/api/v1/live-status/add-promotion';

const patchStoreCustomer = async (storeCustomer) => {
    return await StoreCustomer.query()
        .patch({
            creditAmount: 13,
        })
        .where('id', storeCustomer.id)
        .returning('*');
};

const patchServiceOrder = async (order, serviceOrderArgs) => {
    return await ServiceOrder.query()
        .patch({
            ...serviceOrderArgs,
        })
        .findById(order.orderableId)
        .returning('*');
};

const createFactories = async (storeCustomer, store, order, serviceOrderArgs) => {
    await patchStoreCustomer(storeCustomer);

    const serviceOrder = await patchServiceOrder(order, serviceOrderArgs);
    const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
        orderId: serviceOrder.id,
    });
    const serviceMaster = await factory.create(FN.serviceMaster);
    const servicePrice = await factory.create(FN.servicePrice, {
        serviceId: serviceMaster.id,
    });
    const subscription = await factory.create(FN.recurringSubscription, { storeId: store.id });

    await factory.create(FN.serviceOrderRecurringSubscription, {
        recurringSubscriptionId: subscription.id,
        serviceOrderId: serviceOrder.id,
    });
    await factory.create(FN.orderDelivery, {
        orderId: order.id,
        type: ORDER_DELIVERY_TYPES.PICKUP,
        status: orderDeliveryStatuses.SCHEDULED,
    });

    const inventoryItem = await factory.create(FN.inventoryItem);
    const serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
        servicePriceId: servicePrice.id,
        orderItemId: serviceOrderItem.id,
        serviceId: serviceMaster.id,
        inventoryItemId: inventoryItem.id,
    });

    await factory.create(FN.serviceReferenceItemDetail, {
        serviceReferenceItemId: serviceReferenceItem.id,
        soldItemId: inventoryItem.id,
        soldItemType: inventoryItem,
        lineItemName: 'test',
        lineItemTotalCost: 10,
        lineItemUnitCost: 1,
    });
    await StoreSettings.query()
        .where({ processingCapability: 'BASIC' })
        .patch({
            timeZone: 'America/Los_Angeles',
        })
        .returning('*');
};

describe(`test ${apiEndpoint} API endpoint`, () => {
    describe('with mocked Pipeline stages (/tip)', () => {
        let response;

        describe('that running successful', () => {
            let stubbedPipelineRun;

            beforeEach(async () => {
                const {
                    tokens: { customerToken, orderToken },
                    environment: { order },
                } = await createOrderAndCustomerTokensWithRelations();

                await patchServiceOrder(order, { balanceDue: 999 });

                const mock = await endpointPipelineMock({
                    method: 'patch',
                    apiEndpoint: `${apiEndpoint}/tip`,
                    params: { token: orderToken },
                    headers: { customerauthtoken: customerToken },
                    body: {
                        isTipRemoved: false,
                        appliedTip: 'appliedTip',
                    },
                });
                stubbedPipelineRun = mock.stubbedPipelineRun;
                response = mock.response;
            });

            it('Pipeline run should be called and return correct response', () => {
                expect(stubbedPipelineRun.called).to.be.true;
                response.should.have.status(200);
                response.body.should.not.be.empty;
                response.body.should.have.property('order');
                response.body.should.have.property('success', true);
            });
        });

        describe('that running with error', () => {
            beforeEach(async () => {
                const {
                    tokens: { customerToken, orderToken },
                    environment: { order },
                } = await createOrderAndCustomerTokensWithRelations();

                await patchServiceOrder(order, { balanceDue: 999 });

                response = await endpointPipelineErrorMock({
                    method: 'patch',
                    apiEndpoint: `${apiEndpoint}/tip`,
                    params: { token: orderToken },
                    headers: { customerauthtoken: customerToken },
                    body: {
                        isTipRemoved: false,
                        appliedTip: 'appliedTip',
                    },
                });
            });
            it('Pipeline should catch Error', async () => {
                response.should.have.status(500);
                expect(response.body).to.eql({
                    error: 'Pipeline error!',
                });
            });
        });
    });

    describe('with mocked Pipeline stages (/add-credits)', () => {
        let response;

        describe('that running successful', () => {
            let stubbedPipelineRun;

            beforeEach(async () => {
                const {
                    tokens: { customerToken, orderToken },
                    environment: { store, order, storeCustomer },
                } = await createOrderAndCustomerTokensWithRelations();

                await createFactories(storeCustomer, store, order, {
                    orderTotal: 999,
                    netOrderTotal: 999,
                    paymentStatus: 'UNPAID',
                    status: statuses.DESIGNATED_FOR_PROCESSING_AT_HUB,
                    orderType: ORDER_TYPES.ONLINE,
                });

                const mock = await endpointPipelineMock({
                    method: 'patch',
                    apiEndpoint: `${apiEndpoint}/add-credits`,
                    params: { token: orderToken },
                    headers: { customerauthtoken: customerToken },
                    body: {
                        appliedCredits: 1,
                    },
                });
                stubbedPipelineRun = mock.stubbedPipelineRun;
                response = mock.response;
            });

            it('Pipeline run should be called and return correct response', () => {
                expect(stubbedPipelineRun.called).to.be.true;
                response.should.have.status(200);
                response.body.should.not.be.empty;
                response.body.should.have.property('order');
                response.body.should.have.property('success', true);
            });
        });

        describe('that running with error', () => {
            beforeEach(async () => {
                const {
                    tokens: { customerToken, orderToken },
                    environment: { store, order, storeCustomer },
                } = await createOrderAndCustomerTokensWithRelations();

                await createFactories(storeCustomer, store, order, {
                    orderTotal: 999,
                    netOrderTotal: 999,
                    paymentStatus: 'UNPAID',
                    status: statuses.DESIGNATED_FOR_PROCESSING_AT_HUB,
                    orderType: ORDER_TYPES.ONLINE,
                });

                response = await endpointPipelineErrorMock({
                    method: 'patch',
                    apiEndpoint: `${apiEndpoint}/add-credits`,
                    params: { token: orderToken },
                    headers: { customerauthtoken: customerToken },
                    body: {
                        appliedCredits: 1,
                    },
                });
            });
            it('Pipeline should catch Error', async () => {
                response.should.have.status(500);
                expect(response.body).to.eql({
                    error: 'Pipeline error!',
                });
            });
        });
    });

    describe('with full pipeline stages (/add-credits)', async () => {
        describe('should return correct response', async () => {
            let response, body, token, customerauthtoken;

            beforeEach(async () => {
                const {
                    environment: { centsCustomer, storeCustomer, order },
                } = await createOrderAndCustomerTokensWithRelations();

                await patchStoreCustomer(storeCustomer);
                const serviceOrder = await patchServiceOrder(order, {
                    balanceDue: 999,
                    orderTotal: -1,
                    netOrderTotal: -1,
                });

                token = generateLiveLinkOrderToken({
                    id: serviceOrder.id,
                });
                customerauthtoken = generateLiveLinkCustomerToken({
                    id: centsCustomer.id,
                });

                body = {
                    appliedCredits: 1,
                };

                response = await ChaiHttpRequestHelper.patch(
                    `${apiEndpoint}/add-credits`,
                    { token },
                    body,
                ).set('customerauthtoken', customerauthtoken);
            });

            it('should return correct response status and body', () => {
                const {
                    body: { order },
                } = response;

                response.should.have.status(200);
                response.body.should.have.property('success', true);
                response.body.should.have.property('order');
                expect(order).to.have.property('canCancel').to.be.false;
                expect(order).to.have.property('pickupDeliveryFee').to.be.equal(0);
                expect(order).to.have.property('pickupDeliveryTip').to.be.equal(0);
                expect(order).to.have.property('refundAmount').to.be.equal(0);
                expect(order).to.have.property('returnDeliveryTip').to.be.equal(0);
                expect(order).to.have.property('taxAmount').to.be.equal(0);
                expect(order).to.have.property('tipAmount').to.be.equal(0);
                expect(order).to.have.property('tipOption').to.be.equal('');
            });
        });
    });

    describe('with mocked Pipeline stages (/remove-promotion)', () => {
        let response;

        describe('that running successful', () => {
            let stubbedPipelineRun;

            beforeEach(async () => {
                const {
                    tokens: { customerToken, orderToken },
                    environment: { store, order, storeCustomer },
                } = await createOrderAndCustomerTokensWithRelations();

                const promotion = await factory.create(FN.promotion);

                await createFactories(storeCustomer, store, order, {
                    orderTotal: 999,
                    netOrderTotal: 999,
                    paymentStatus: 'UNPAID',
                    status: statuses.DESIGNATED_FOR_PROCESSING_AT_HUB,
                    orderType: ORDER_TYPES.ONLINE,
                    promotionId: promotion.id,
                });

                const mock = await endpointPipelineMock({
                    method: 'patch',
                    apiEndpoint: `${apiEndpoint}/remove-promotion`,
                    params: { token: orderToken },
                    headers: { customerauthtoken: customerToken },
                    body: {
                        isPromoRemoved: false
                    }
                });
                stubbedPipelineRun = mock.stubbedPipelineRun;
                response = mock.response;
            });

            it('Pipeline run should be called and return correct response', () => {
                expect(stubbedPipelineRun.called).to.be.true;
                response.should.have.status(200);
                response.body.should.not.be.empty;
                response.body.should.have.property('order');
                response.body.should.have.property('success', true);
            });
        });

        describe('that running with error', () => {
            beforeEach(async () => {
                const {
                    tokens: { customerToken, orderToken },
                    environment: { store, order, storeCustomer },
                } = await createOrderAndCustomerTokensWithRelations();

                const promotion = await factory.create(FN.promotion);

                await createFactories(storeCustomer, store, order, {
                    orderTotal: 999,
                    netOrderTotal: 999,
                    paymentStatus: 'UNPAID',
                    status: statuses.DESIGNATED_FOR_PROCESSING_AT_HUB,
                    orderType: ORDER_TYPES.ONLINE,
                    promotionId: promotion.id,
                });

                response = await endpointPipelineErrorMock({
                    method: 'patch',
                    apiEndpoint: `${apiEndpoint}/remove-promotion`,
                    params: { token: orderToken },
                    headers: { customerauthtoken: customerToken },
                    body: {
                        isPromoRemoved: false
                    }
                })
            });
            it('Pipeline should catch Error', async () => {
                response.should.have.status(500);
                expect(response.body).to.eql({
                    error: 'Pipeline error!',
                });
            });
        });
    });

    describe('with full pipeline stages (/remove-promotion)', async () => {
        describe('should return correct response', async () => {
            let response, body, token, customerauthtoken;

            beforeEach(async () => {
                const {
                    environment: { centsCustomer, storeCustomer, order },
                } = await createOrderAndCustomerTokensWithRelations();

                const promotion = await factory.create(FN.promotion);

                await patchStoreCustomer(storeCustomer);
                const serviceOrder = await patchServiceOrder(order, {
                    balanceDue: 999,
                    orderTotal: -1,
                    netOrderTotal: -1,
                    promotionId: promotion.id,
                });

                token = generateLiveLinkOrderToken({
                    id: serviceOrder.id,
                });
                customerauthtoken = generateLiveLinkCustomerToken({
                    id: centsCustomer.id,
                });

                body = {
                    isPromoRemoved: false
                };

                response = await ChaiHttpRequestHelper.patch(`${apiEndpoint}/remove-promotion`, { token }, body)
                    .set('customerauthtoken', customerauthtoken);
            });

            it('should return correct response status and body', () => {
                const {
                    body: { order },
                } = response;

                response.should.have.status(200);
                response.body.should.have.property('success', true);
                response.body.should.have.property('order');
                expect(order).to.have.property('canCancel').to.be.false;
                expect(order).to.have.property('pickupDeliveryFee').to.be.equal(0);
                expect(order).to.have.property('pickupDeliveryTip').to.be.equal(0);
                expect(order).to.have.property('refundAmount').to.be.equal(0);
                expect(order).to.have.property('returnDeliveryTip').to.be.equal(0);
                expect(order).to.have.property('taxAmount').to.be.equal(0);
                expect(order).to.have.property('tipAmount').to.be.equal(0);
                expect(order).to.have.property('tipOption').to.be.equal('');
            });
        });
    });

    describe('with mocked Pipeline stages (/remove-credits)', () => {
        let response;

        describe('that running successful', () => {
            let stubbedPipelineRun;

            beforeEach(async () => {
                const {
                    tokens: { customerToken, orderToken },
                    environment: { store, order, storeCustomer },
                } = await createOrderAndCustomerTokensWithRelations();

                await createFactories(storeCustomer, store, order, {
                    orderTotal: 999,
                    netOrderTotal: 999,
                    paymentStatus: 'UNPAID',
                    status: statuses.DESIGNATED_FOR_PROCESSING_AT_HUB,
                    orderType: ORDER_TYPES.ONLINE,
                    creditAmount: 999,
                });

                const mock = await endpointPipelineMock({
                    method: 'patch',
                    apiEndpoint: `${apiEndpoint}/remove-credits`,
                    params: { token: orderToken },
                    headers: { customerauthtoken: customerToken },
                    body: {
                        isCreditRemoved: false
                    }
                });
                stubbedPipelineRun = mock.stubbedPipelineRun;
                response = mock.response;
            });

            it('Pipeline run should be called and return correct response', () => {
                expect(stubbedPipelineRun.called).to.be.true;
                response.should.have.status(200);
                response.body.should.not.be.empty;
                response.body.should.have.property('order');
                response.body.should.have.property('success', true);
            });
        });

        describe('that running with error', () => {
            beforeEach(async () => {
                const {
                    tokens: { customerToken, orderToken },
                    environment: { store, order, storeCustomer },
                } = await createOrderAndCustomerTokensWithRelations();

                await createFactories(storeCustomer, store, order, {
                    orderTotal: 999,
                    netOrderTotal: 999,
                    paymentStatus: 'UNPAID',
                    status: statuses.DESIGNATED_FOR_PROCESSING_AT_HUB,
                    orderType: ORDER_TYPES.ONLINE,
                    creditAmount: 999,
                });

                response = await endpointPipelineErrorMock({
                    method: 'patch',
                    apiEndpoint: `${apiEndpoint}/remove-credits`,
                    params: { token: orderToken },
                    headers: { customerauthtoken: customerToken },
                    body: {
                        isCreditRemoved: false
                    }
                })
            });
            it('Pipeline should catch Error', async () => {
                response.should.have.status(500);
                expect(response.body).to.eql({
                    error: 'Pipeline error!',
                });
            });
        });
    });

    describe('with full pipeline stages (/remove-credits)', async () => {
        describe('should return correct response', async () => {
            let response, body, token, customerauthtoken;

            it('should return correct response status and body', async () => {
                const {
                    environment: { centsCustomer, storeCustomer, order, store },
                } = await createOrderAndCustomerTokensWithRelations();

                await patchStoreCustomer(storeCustomer);
                const serviceOrder = await patchServiceOrder(order, {
                    balanceDue: 999,
                    orderTotal: -1,
                    netOrderTotal: -1,
                    creditAmount: 999,
                });

                const creditReason = await factory.create('creditReason', {
                    reason: 'Order Adjustment'
                });

                await factory.create('creditHistory', {
                    businessId: store.businessId,
                    customerId: centsCustomer.id,
                    amount: 999,
                    reasonId: creditReason.id,
                });

                token = generateLiveLinkOrderToken({
                    id: serviceOrder.id,
                });
                customerauthtoken = generateLiveLinkCustomerToken({
                    id: centsCustomer.id,
                });

                body = {
                    isCreditRemoved: false
                };

                response = await ChaiHttpRequestHelper.patch(`${apiEndpoint}/remove-credits`, { token }, body)
                    .set('customerauthtoken', customerauthtoken);

                response.should.have.status(200);
                response.body.should.have.property('success', true);
                response.body.should.have.property('order');
                expect(response.body.order).to.have.property('canCancel').to.be.false;
                expect(response.body.order).to.have.property('pickupDeliveryFee').to.be.equal(0);
                expect(response.body.order).to.have.property('pickupDeliveryTip').to.be.equal(0);
                expect(response.body.order).to.have.property('refundAmount').to.be.equal(0);
                expect(response.body.order).to.have.property('returnDeliveryTip').to.be.equal(0);
                expect(response.body.order).to.have.property('taxAmount').to.be.equal(0);
                expect(response.body.order).to.have.property('tipAmount').to.be.equal(0);
                expect(response.body.order).to.have.property('tipOption').to.be.equal('');
                expect(response.body.order).to.have.property('creditAmount').to.be.equal(0);
            });

            it('should return error when creditAmount is absent', async () => {
                const {
                    environment: { centsCustomer, storeCustomer, order, store },
                } = await createOrderAndCustomerTokensWithRelations();

                await patchStoreCustomer(storeCustomer);
                const serviceOrder = await patchServiceOrder(order, {
                    balanceDue: 999,
                    orderTotal: -1,
                    netOrderTotal: -1,
                });

                const creditReason = await factory.create('creditReason', {
                    reason: 'Order Adjustment'
                });

                await factory.create('creditHistory', {
                    businessId: store.businessId,
                    customerId: centsCustomer.id,
                    amount: 999,
                    reasonId: creditReason.id,
                });

                token = generateLiveLinkOrderToken({
                    id: serviceOrder.id,
                });
                customerauthtoken = generateLiveLinkCustomerToken({
                    id: centsCustomer.id,
                });

                body = {
                    isCreditRemoved: false
                };

                response = await ChaiHttpRequestHelper.patch(`${apiEndpoint}/remove-credits`, { token }, body)
                    .set('customerauthtoken', customerauthtoken);

                response.should.have.status(409);
                response.body.should.have.property('error', 'Can not remove credits as it was not applied.');
                response.body.should.not.have.property('order');
            });
        });
    });
});

describe(`test ${tipApiEndpoint} API`, () => {
    describe('tokens are invalid', async () => {
        it('should return status 422 if order token is empty', async () => {
            const response = await ChaiHttpRequestHelper.patch(tipApiEndpoint, {});

            expect(response.status).to.be.equal(422);
        });

        it('should return status 403 if order token is invalid', async () => {
            const response = await ChaiHttpRequestHelper.patch(tipApiEndpoint, { token: 'token' });

            expect(response.status).to.be.equal(403);
        });

        it('should return status 401 if customer token is empty', async () => {
            const token = generateLiveLinkOrderToken({
                id: 1,
            });
            const response = await ChaiHttpRequestHelper.patch(tipApiEndpoint, { token });

            expect(response.status).to.be.equal(401);
        });

        it('should return status 403 if customer token is invalid', async () => {
            const token = generateLiveLinkOrderToken({
                id: 1,
            });
            const customerauthtoken = generateLiveLinkCustomerToken({
                id: 0,
            });
            const response = await ChaiHttpRequestHelper.patch(tipApiEndpoint, { token }).set({
                customerauthtoken,
            });

            expect(response.status).to.be.equal(401);
        });
    });

    describe('body is invalid', async () => {
        it('should return status 422 if missing params', async () => {
            const { tokens } = await createOrderAndCustomerTokensWithRelations();
            const params = {
                token: tokens.orderToken,
            };
            const body = {};
            const response = await ChaiHttpRequestHelper.patch(tipApiEndpoint, params, body).set({
                customerauthtoken: tokens.customerToken,
            });
            expect(response.status).to.be.equal(422);
        });

        it('should return status 409 if isTipRemoved is true and tipAmount is empty', async () => {
            const { tokens } = await createOrderAndCustomerTokensWithRelations();
            const params = {
                token: tokens.orderToken,
            };
            const body = {
                isTipRemoved: true,
            };
            const response = await ChaiHttpRequestHelper.patch(tipApiEndpoint, params, body).set({
                customerauthtoken: tokens.customerToken,
            });
            expect(response.status).to.be.equal(409);
        });

        it('should return status 404 if appliedTip less than 0.1', async () => {
            const { tokens } = await createOrderAndCustomerTokensWithRelations();
            const params = {
                token: tokens.orderToken,
            };
            const body = {
                isTipRemoved: false,
                appliedTip: '0.01',
            };
            const response = await ChaiHttpRequestHelper.patch(tipApiEndpoint, params, body).set({
                customerauthtoken: tokens.customerToken,
            });
            expect(response.status).to.be.equal(404);
        });
    });

    describe('valid request', async () => {
        it('should update serviceOrder', async () => {
            const { tokens } = await createOrderAndCustomerTokensWithRelations();
            const params = {
                token: tokens.orderToken,
            };
            const tip = 63;
            const body = {
                isTipRemoved: false,
                appliedTip: tip.toString(),
            };
            const response = await ChaiHttpRequestHelper.patch(tipApiEndpoint, params, body).set({
                customerauthtoken: tokens.customerToken,
            });

            // check response
            expect(response.status).to.be.equal(200);
            expect(response.body).to.have.property('success');
            expect(response.body).to.have.property('order');
            expect(response.body.success).to.be.true;

            // check instance
            const updatedServiceOrder = await ServiceOrder.query().findById(
                response.body.order.orderId,
            );

            expect(updatedServiceOrder.tipAmount).to.be.equal(tip);
        });
    });
});

describe(`test ${addPromotionApiEndpoint} API endpoint`, () => {
    it('should update service order instance - add promotion field', async () => {
        const daysOfWeek = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
        ];
        const { tokens, environment } = await createOrderAndCustomerTokensWithRelations();
        const tipAmount = 10;
        const serviceOrder = await ServiceOrder.query()
            .findById(environment.serviceOrder.id)
            .patch({
                orderType: 'ONLINE',
                tipOption: 10,
                orderTotal: 2,
            })
            .returning('*');
        const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });
        const serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
        });
        const serviceReferenceItemDetails = await factory.create(
            'serviceReferenceItemDetailForServicePrices',
            {
                serviceReferenceItemId: serviceReferenceItem.id,
            },
        );
        const servicePrice = await factory.create(FN.servicePrice, {
            storeId: environment.store.id,
        });
        const inventoryItems = await factory.create(FN.inventoryItem, {
            storeId: environment.store.id,
        });
        const promotion = await factory.create(FN.promotion, {
            businessId: environment.store.businessId,
            promotionType: 'not-fixed-price-discount',
            active: true,
            appliesToType: 'entire-order',
            customerRedemptionLimit: 0,
            activeDays: JSON.stringify(
                daysOfWeek.map((day) => {
                    return { day };
                }),
            ),
        });

        const orderToken = generateLiveLinkOrderToken({
            id: serviceOrder.id,
            centsCustomerId: environment.centsCustomer.id,
            businessId: environment.store.businessId,
            previousTipOption: tipAmount,
        });

        const params = {
            token: orderToken,
            id: serviceOrder.id,
        };
        const body = {
            promoCode: promotion.name,
        };
        const response = await ChaiHttpRequestHelper.patch(
            addPromotionApiEndpoint,
            params,
            body,
        ).set({
            customerauthtoken: tokens.customerToken,
        });

        // check response
        expect(response.status).to.be.equal(200);
        expect(response.body).to.have.property('success');
        expect(response.body).to.have.property('order');
        expect(response.body.success).to.be.true;

        // check updated instance
        const updatedServiceOrder = await ServiceOrder.query().findById(serviceOrder.id);
        expect(updatedServiceOrder.promotionId).to.be.equal(promotion.id);
        expect(updatedServiceOrder.promotionId).to.be.equal(response.body.order.promotionId);
    });

    it('should not update promotionId if promotionAmount is 0', async () => {
        const daysOfWeek = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
        ];
        const { tokens, environment } = await createOrderAndCustomerTokensWithRelations();
        const tipAmount = 10;
        const serviceOrder = await ServiceOrder.query()
            .findById(environment.serviceOrder.id)
            .patch({
                orderType: 'ONLINE',
            })
            .returning('*');
        const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });
        const serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
        });
        const serviceReferenceItemDetails = await factory.create(
            'serviceReferenceItemDetailForServicePrices',
            {
                serviceReferenceItemId: serviceReferenceItem.id,
            },
        );
        const servicePrice = await factory.create(FN.servicePrice, {
            storeId: environment.store.id,
        });
        const inventoryItems = await factory.create(FN.inventoryItem, {
            storeId: environment.store.id,
        });
        const promotion = await factory.create(FN.promotion, {
            businessId: environment.store.businessId,
            promotionType: 'not-fixed-price-discount',
            active: true,
            appliesToType: 'entire-order',
            customerRedemptionLimit: 0,
            activeDays: JSON.stringify(
                daysOfWeek.map((day) => {
                    return { day };
                }),
            ),
        });

        const orderToken = generateLiveLinkOrderToken({
            id: serviceOrder.id,
            centsCustomerId: environment.centsCustomer.id,
            businessId: environment.store.businessId,
            previousTipOption: tipAmount,
        });

        const params = {
            token: orderToken,
            id: serviceOrder.id,
        };
        const body = {
            promoCode: promotion.name,
        };
        const response = await ChaiHttpRequestHelper.patch(
            addPromotionApiEndpoint,
            params,
            body,
        ).set({
            customerauthtoken: tokens.customerToken,
        });

        // check response
        expect(response.status).to.be.equal(200);
        expect(response.body).to.have.property('success');
        expect(response.body).to.have.property('order');
        expect(response.body.success).to.be.true;

        // check updated instance
        const updatedServiceOrder = await ServiceOrder.query().findById(serviceOrder.id);
        expect(updatedServiceOrder.promotionId).to.be.null;
        expect(updatedServiceOrder.promotionAmount).to.be.equal(0);
    });
});

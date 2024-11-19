require('../../testHelper');
const sinon = require('sinon');
const factory = require('../../factories');
const { expect, assert } = require('../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const stripe = require('../../../stripe/stripeWithSecret');
const JwtService = require('../../../services/tokenOperations/main');
const BusinessSettings = require('../../../models/businessSettings');
const StoreSettings = require('../../../models/storeSettings');
const {
    statuses,
    orderDeliveryStatuses,
    PAYMENT_METHOD_PROVIDERS,
    ORDER_TYPES,
} = require('../../../constants/constants');
const { PAYMENT_INTENT_STATUSES } = require('../../constants/statuses');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const {
    STRIPE_PAYMENT_METHOD,
    CREATE_STRIPE_INTENT_RESPONSE,
} = require('../../constants/responseMocks');

const apiEndpoint = '/api/v1/live-status/';
describe(`test ${apiEndpoint} API endpoint`, () => {
    const createTokens = (serviceOrder, centsCustomer) => {
        const jwtCustomerService = new JwtService(JSON.stringify(serviceOrder));
        const token = jwtCustomerService.tokenGenerator(process.env.JWT_SECRET_LIVE_LINK_CUSTOMER);
        const jwtOrderService = new JwtService(JSON.stringify(centsCustomer));
        const customerauthtoken = jwtOrderService.tokenGenerator(
            process.env.JWT_SECRET_TOKEN_ORDER,
        );

        return { token, customerauthtoken };
    };

    describe('should return correct order', () => {
        const defaultAssert = (
            response,
            serviceOrder,
            order,
            store,
            storeSettings,
            storeCustomer,
            centsCustomer,
        ) => {
            response.should.have.status(200);
            expect(response.body).have.property('order').to.be.an('object');
            expect(response.body.order).have.property('orderId', serviceOrder.id);
            expect(response.body.order).have.property('masterOrderId', order.id);
            expect(response.body.order).have.property('status', serviceOrder.status);
            expect(response.body.order).have.property('balanceDue', serviceOrder.balanceDue);
            expect(response.body.order).have.property('netOrderTotal', serviceOrder.netOrderTotal);
            expect(response.body.order).have.property('returnMethod', serviceOrder.returnMethod);
            expect(response.body.order).have.property('orderType', serviceOrder.orderType);
            expect(response.body.order).have.property('store').have.property('id', store.id);
            expect(response.body.order.store).have.property('timeZone', storeSettings.timeZone);
            expect(response.body.order)
                .have.property('customer')
                .have.property('storeCustomerId', storeCustomer.id);
            expect(response.body.order.customer).have.property('centsCustomerId', centsCustomer.id);
        };

        describe('without partnerSubsidiary and payment method', async () => {
            describe('with % tipOption', async () => {
                it('as orderIntake', async () => {
                    const tipOption = '10.58493';
                    sinon.stub(stripe.paymentIntents, 'retrieve').returns({ payment_method: null });
                    const {
                        serviceOrder,
                        centsCustomer,
                        store,
                        order,
                        laundromatBusiness,
                        storeSettings,
                        storeCustomer,
                    } = await createUserWithBusinessAndCustomerOrders(
                        {},
                        {
                            serviceOrder: {
                                tipOption: `${tipOption}%`,
                            },
                        },
                    );
                    const tipSettings = await factory.create(FN.tipSetting, {
                        tipType: 'PERCENTAGE',
                        businessId: laundromatBusiness.id,
                    });
                    await BusinessSettings.query()
                        .patch({
                            allowInStoreTip: true,
                        })
                        .where({
                            businessId: laundromatBusiness.id,
                        });
                    const payment = await factory.create(FN.payment, {
                        orderId: order.id,
                        status: PAYMENT_INTENT_STATUSES.requiresConfirmation,
                        totalAmount: serviceOrder.netOrderTotal,
                        transactionFee: 1,
                        currency: 'usd',
                        paymentProcessor: PAYMENT_METHOD_PROVIDERS.STRIPE,
                        storeId: store.id,
                    });
                    await factory.create(FN.orderActivityLog, {
                        orderId: serviceOrder.id,
                        status: statuses.READY_FOR_PROCESSING,
                    });
                    const { token, customerauthtoken } = createTokens(serviceOrder, centsCustomer);
                    const serviceOrderInventoryItem = await factory.create(FN.serviceOrderItem, {
                        orderId: serviceOrder.id,
                    });
                    const referenceInventoryItem = await factory.create(FN.serviceReferenceItem, {
                        orderItemId: serviceOrderInventoryItem.id,
                    });
                    const lineItemDetails = await factory.create(
                        FN.serviceReferenceItemDetailForServicePrice,
                        {
                            soldItemType: 'InventoryItem',
                            serviceReferenceItemId: referenceInventoryItem.id,
                            lineItemTotalCost:
                                referenceInventoryItem.quantity * referenceInventoryItem.unitCost,
                            lineItemQuantity: referenceInventoryItem.quantity,
                            lineItemUnitCost: referenceInventoryItem.unitCost,
                            category: 'PER_POUND',
                        },
                    );

                    // request
                    const response = await ChaiHttpRequestHelper.get(apiEndpoint, {
                        token,
                    }).set({
                        customerauthtoken,
                    });

                    // assert
                    defaultAssert(
                        response,
                        serviceOrder,
                        order,
                        store,
                        storeSettings,
                        storeCustomer,
                        centsCustomer,
                    );
                    expect(response.body.order).have.property('orderType', ORDER_TYPES.SERVICE);
                    expect(response.body.order).have.property(
                        'tipOption',
                        `${Number(tipOption).toFixed(2)}%`,
                    );
                    expect(response.body.order).have.property('timeline').have.property('step', 3);
                    expect(response.body.order)
                        .have.property('orderItems')
                        .to.be.an('array')
                        .lengthOf(1);
                    expect(response.body.order.orderItems[0]).have.property(
                        'orderItemId',
                        serviceOrderInventoryItem.id,
                    );
                    expect(response.body.order.orderItems[0]).have.property(
                        'inventoryItemId',
                        lineItemDetails.soldItemId,
                    );
                    expect(response.body.order.orderItems[0]).have.property('hasMinPrice', false);
                    expect(response.body.order)
                        .have.property('store')
                        .have.property('settings')
                        .have.property('tipType', tipSettings.tipType);
                    expect(response.body.order).have.property('pickup').is.empty;
                    expect(response.body.order).have.property('delivery').is.empty;
                    expect(response.body.order).have.property('isIntakeComplete').to.be.true;
                    const paymentIntent = {
                        id: payment.id,
                        paymentMethod: {
                            paymentMethodToken: null,
                            brand: null,
                            last4: null,
                            provider: PAYMENT_METHOD_PROVIDERS.STRIPE,
                        },
                        paymentToken: payment.paymentToken,
                        totalAmount: payment.totalAmount,
                    };
                    assert.deepOwnInclude(response.body.order.latestPayment, paymentIntent);
                });
            });

            describe('with $ tipOption', async () => {
                describe('as not orderIntake', () => {
                    it('with orderItems and modifiers', async () => {
                        const tipOption = '10.58493';
                        sinon
                            .stub(stripe.paymentIntents, 'retrieve')
                            .returns({ payment_method: null });
                        const {
                            serviceOrder,
                            centsCustomer,
                            store,
                            order,
                            laundromatBusiness,
                            storeSettings,
                            storeCustomer,
                        } = await createUserWithBusinessAndCustomerOrders(
                            {},
                            {
                                serviceOrder: {
                                    tipOption: `$${tipOption}`,
                                },
                            },
                        );
                        await BusinessSettings.query()
                            .patch({
                                allowInStoreTip: true,
                            })
                            .where({
                                businessId: laundromatBusiness.id,
                            });
                        const tipSettings = await factory.create(FN.tipSetting, {
                            tipType: 'DOLLAR_AMOUNT',
                            businessId: laundromatBusiness.id,
                        });
                        const payment = await factory.create(FN.payment, {
                            orderId: order.id,
                            status: PAYMENT_INTENT_STATUSES.requiresConfirmation,
                            totalAmount: serviceOrder.netOrderTotal,
                            transactionFee: 1,
                            currency: 'usd',
                            paymentProcessor: PAYMENT_METHOD_PROVIDERS.STRIPE,
                            storeId: store.id,
                        });
                        await factory.create(FN.orderActivityLog, {
                            orderId: serviceOrder.id,
                            status: statuses.SUBMITTED,
                        });
                        const serviceOrderItemWithModifier = await factory.create(
                            FN.serviceOrderItem,
                            {
                                orderId: serviceOrder.id,
                            },
                        );
                        const referenceItemModifier = await factory.create(
                            FN.serviceReferenceItem,
                            {
                                orderItemId: serviceOrderItemWithModifier.id,
                            },
                        );
                        const lineItemDetailsModifier = await factory.create(
                            FN.serviceReferenceItemDetailForServicePrice,
                            {
                                serviceReferenceItemId: referenceItemModifier.id,
                                soldItemType: 'Modifier',
                                lineItemTotalCost:
                                    referenceItemModifier.quantity * referenceItemModifier.unitCost,
                                lineItemQuantity: referenceItemModifier.quantity,
                                lineItemUnitCost: referenceItemModifier.unitCost,
                                category: 'PER_POUND',
                            },
                        );
                        await factory.create(FN.orderPromoDetail, {
                            orderId: order.id,
                            promoDetails: {
                                appliesToType: 'specific-items',
                            },
                            itemIds: [lineItemDetailsModifier.id],
                        });
                        const serviceOrderServiceItem = await factory.create(FN.serviceOrderItem, {
                            orderId: serviceOrder.id,
                        });
                        const referenceServiceItem = await factory.create(FN.serviceReferenceItem, {
                            orderItemId: serviceOrderServiceItem.id,
                        });
                        await factory.create(FN.serviceReferenceItemDetailForServicePrice, {
                            soldItemType: 'ServicePrices',
                            serviceReferenceItemId: referenceServiceItem.id,
                            lineItemTotalCost:
                                referenceServiceItem.quantity * referenceServiceItem.unitCost,
                            lineItemQuantity: referenceServiceItem.quantity,
                            lineItemUnitCost: referenceServiceItem.unitCost,
                            category: 'PER_POUND',
                        });
                        const { token, customerauthtoken } = createTokens(
                            serviceOrder,
                            centsCustomer,
                        );

                        // request
                        const response = await ChaiHttpRequestHelper.get(apiEndpoint, {
                            token,
                        }).set({
                            customerauthtoken,
                        });

                        // assert
                        defaultAssert(
                            response,
                            serviceOrder,
                            order,
                            store,
                            storeSettings,
                            storeCustomer,
                            centsCustomer,
                        );
                        expect(response.body.order).have.property('orderType', ORDER_TYPES.SERVICE);
                        expect(response.body.order).have.property(
                            'tipOption',
                            `$${Number(tipOption).toFixed(2)}`,
                        );
                        expect(response.body.order)
                            .have.property('timeline')
                            .have.property('step', 2);
                        expect(response.body.order)
                            .have.property('orderItems')
                            .to.be.an('array')
                            .lengthOf(1);
                        expect(response.body.order.orderItems[0]).have.property(
                            'orderItemId',
                            serviceOrderServiceItem.id,
                        );
                        expect(response.body.order.orderItems[0])
                            .have.property('modifiers')
                            .to.be.an('array')
                            .lengthOf(1);
                        expect(response.body.order.orderItems[0]).have.property(
                            'hasMinPrice',
                            false,
                        );
                        expect(response.body.order)
                            .have.property('store')
                            .have.property('settings')
                            .have.property('tipType', tipSettings.tipType);
                        expect(response.body.order).have.property('pickup').is.empty;
                        expect(response.body.order).have.property('delivery').is.empty;
                        expect(response.body.order).have.property('isIntakeComplete').to.be.false;
                        const paymentIntent = {
                            id: payment.id,
                            paymentMethod: {
                                paymentMethodToken: null,
                                brand: null,
                                last4: null,
                                provider: PAYMENT_METHOD_PROVIDERS.STRIPE,
                            },
                            paymentToken: payment.paymentToken,
                            totalAmount: payment.totalAmount,
                        };
                        assert.deepOwnInclude(response.body.order.latestPayment, paymentIntent);
                    });
                });
            });

            describe('with allowed tips', () => {
                describe('with deliveries and subscription', () => {
                    describe('with subscription', () => {
                        it('with ServiceMasterItem', async () => {
                            const timeZone = 'America/Los_Angeles';
                            sinon
                                .stub(stripe.paymentIntents, 'retrieve')
                                .returns({ payment_method: null });
                            const {
                                serviceOrder,
                                centsCustomer,
                                store,
                                order,
                                storeCustomer,
                                storeSettings: initialStoreSettings,
                                laundromatBusiness,
                            } = await createUserWithBusinessAndCustomerOrders(
                                {},
                                {
                                    serviceOrder: {
                                        orderType: ORDER_TYPES.ONLINE,
                                    },
                                },
                            );
                            await BusinessSettings.query()
                                .patch({
                                    allowInStoreTip: true,
                                })
                                .where({
                                    businessId: laundromatBusiness.id,
                                });
                            await StoreSettings.query()
                                .patch({
                                    timeZone,
                                })
                                .findById(initialStoreSettings.id);
                            const payment = await factory.create(FN.payment, {
                                orderId: order.id,
                                status: PAYMENT_INTENT_STATUSES.requiresConfirmation,
                                totalAmount: serviceOrder.netOrderTotal,
                                transactionFee: 1,
                                currency: 'usd',
                                paymentProcessor: PAYMENT_METHOD_PROVIDERS.STRIPE,
                                storeId: store.id,
                            });
                            await factory.create(FN.orderActivityLog, {
                                orderId: serviceOrder.id,
                                status: 'DESIGNATED_FOR_PROCESSING_AT_HUB',
                            });
                            await factory.create(FN.paymentMethod, {
                                centsCustomerId: centsCustomer.id,
                            });
                            const serviceOrderServiceMaster = await factory.create(
                                FN.serviceOrderItem,
                                {
                                    orderId: serviceOrder.id,
                                },
                            );
                            const referenceServiceMasterItem = await factory.create(
                                FN.serviceReferenceItem,
                                {
                                    orderItemId: serviceOrderServiceMaster.id,
                                },
                            );
                            await factory.create(FN.serviceReferenceItemDetailForServicePrice, {
                                soldItemType: 'ServicesMaster',
                                serviceReferenceItemId: referenceServiceMasterItem.id,
                                lineItemTotalCost:
                                    referenceServiceMasterItem.quantity *
                                    referenceServiceMasterItem.unitCost,
                                lineItemQuantity: referenceServiceMasterItem.quantity,
                                lineItemUnitCost: referenceServiceMasterItem.unitCost,
                                category: 'PER_POUND',
                            });
                            const serviceOrderRecurringSubscription = await factory.create(
                                FN.serviceOrderRecurringSubscription,
                                {
                                    serviceOrderId: serviceOrder.id,
                                },
                            );
                            const pickUpDelivery = await factory.create(FN.orderDelivery, {
                                orderId: order.id,
                                storeId: store.id,
                                storeCustomerId: storeCustomer.id,
                                type: 'PICKUP',
                                status: orderDeliveryStatuses.SCHEDULED,
                            });
                            const returnDelivery = await factory.create(FN.orderDelivery, {
                                orderId: order.id,
                                storeId: store.id,
                                storeCustomerId: storeCustomer.id,
                                type: 'RETURN',
                                status: orderDeliveryStatuses.SCHEDULED,
                            });
                            const { token, customerauthtoken } = createTokens(
                                serviceOrder,
                                centsCustomer,
                            );

                            // request
                            const response = await ChaiHttpRequestHelper.get(apiEndpoint, {
                                token,
                            }).set({
                                customerauthtoken,
                            });

                            // assert
                            defaultAssert(
                                response,
                                serviceOrder,
                                order,
                                store,
                                { timeZone },
                                storeCustomer,
                                centsCustomer,
                            );
                            expect(response.body.order).have.property(
                                'orderType',
                                ORDER_TYPES.ONLINE,
                            );
                            expect(response.body.order).have.property('tipOption', ``);
                            expect(response.body.order)
                                .have.property('timeline')
                                .have.property('step', 3);
                            expect(response.body.order)
                                .have.property('orderItems')
                                .to.be.an('array')
                                .lengthOf(1);
                            expect(response.body.order.orderItems[0]).have.property(
                                'orderItemId',
                                serviceOrderServiceMaster.id,
                            );
                            expect(response.body.order.orderItems[0])
                                .have.property('modifiers')
                                .to.be.an('array')
                                .lengthOf(0);
                            expect(response.body.order.orderItems[0]).have.property(
                                'hasMinPrice',
                                false,
                            );
                            expect(response.body.order)
                                .have.property('store')
                                .have.property('settings')
                                .have.property('tipType', '');
                            expect(response.body.order)
                                .have.property('subscription')
                                .have.property('id', serviceOrderRecurringSubscription.id);
                            expect(response.body.order.subscription).have.property(
                                'recurringSubscription',
                            );
                            expect(response.body.order).have.property('pickup').not.empty;
                            expect(response.body.order.pickup).have.property(
                                'id',
                                pickUpDelivery.id,
                            );
                            expect(response.body.order).have.property('delivery').not.empty;
                            expect(response.body.order.delivery).have.property(
                                'id',
                                returnDelivery.id,
                            );
                            expect(response.body.order).have.property('isIntakeComplete').to.be
                                .true;
                            const paymentIntent = {
                                id: payment.id,
                                paymentMethod: {
                                    paymentMethodToken: null,
                                    brand: null,
                                    last4: null,
                                    provider: PAYMENT_METHOD_PROVIDERS.STRIPE,
                                },
                                paymentToken: payment.paymentToken,
                                totalAmount: payment.totalAmount,
                            };
                            assert.deepOwnInclude(response.body.order.latestPayment, paymentIntent);
                        });
                    });
                });
            });
        });

        describe('with partnerSubsidiary and payment method', async () => {
            it('is step five', async () => {
                sinon
                    .stub(stripe.paymentIntents, 'retrieve')
                    .returns(CREATE_STRIPE_INTENT_RESPONSE);
                sinon.stub(stripe.paymentMethods, 'retrieve').returns(STRIPE_PAYMENT_METHOD);
                const {
                    serviceOrder,
                    centsCustomer,
                    store,
                    order,
                    storeSettings,
                    partnerSubsidiary,
                    storeCustomer,
                } = await createUserWithBusinessAndCustomerOrders(
                    {
                        createPartnerSubsidiary: true,
                    },
                    {
                        serviceOrder: {
                            orderType: ORDER_TYPES.RESIDENTIAL,
                            status: statuses.COMPLETED,
                        },
                    },
                );
                const payment = await factory.create(FN.payment, {
                    orderId: order.id,
                    status: PAYMENT_INTENT_STATUSES.requiresConfirmation,
                    totalAmount: serviceOrder.netOrderTotal,
                    transactionFee: 1,
                    currency: 'usd',
                    paymentProcessor: PAYMENT_METHOD_PROVIDERS.STRIPE,
                    storeId: store.id,
                });
                await factory.create(FN.orderActivityLog, {
                    orderId: serviceOrder.id,
                    status: statuses.DROPPED_OFF_AT_HUB,
                });
                const { token, customerauthtoken } = createTokens(serviceOrder, centsCustomer);

                // request
                const response = await ChaiHttpRequestHelper.get(apiEndpoint, { token }).set({
                    customerauthtoken,
                });

                // assert
                defaultAssert(
                    response,
                    serviceOrder,
                    order,
                    store,
                    storeSettings,
                    storeCustomer,
                    centsCustomer,
                );
                expect(response.body.order).have.property('orderType', ORDER_TYPES.RESIDENTIAL);
                expect(response.body.order).have.property('tipOption', ``);
                expect(response.body.order)
                    .have.property('store')
                    .have.property('settings')
                    .have.property('tipType', '');
                expect(response.body.order).have.property('timeline').have.property('step', 5);
                expect(response.body.order).have.property('orderItems').to.be.an('array').is.empty;
                expect(response.body.order).have.property('subscription').to.be.an('object').is
                    .empty;
                expect(response.body.order).have.property('pickup').is.empty;
                expect(response.body.order).have.property('delivery').is.empty;
                expect(response.body.order).have.property('isIntakeComplete').to.be.true;
                expect(response.body.order)
                    .have.property('subsidiary')
                    .have.property('id', partnerSubsidiary.id);
                const paymentIntent = {
                    id: payment.id,
                    paymentMethod: {
                        paymentMethodToken: STRIPE_PAYMENT_METHOD.id,
                        brand: STRIPE_PAYMENT_METHOD.card.brand,
                        last4: STRIPE_PAYMENT_METHOD.card.last4,
                        provider: PAYMENT_METHOD_PROVIDERS.STRIPE,
                    },
                    paymentToken: payment.paymentToken,
                    totalAmount: payment.totalAmount,
                };
                assert.deepOwnInclude(response.body.order.latestPayment, paymentIntent);
            });

            describe('is step four', async () => {
                describe('with minimumPrice', async () => {
                    it('without payment', async () => {
                        sinon
                            .stub(stripe.paymentIntents, 'retrieve')
                            .returns(CREATE_STRIPE_INTENT_RESPONSE);
                        sinon
                            .stub(stripe.paymentMethods, 'retrieve')
                            .returns(STRIPE_PAYMENT_METHOD);
                        const {
                            serviceOrder,
                            centsCustomer,
                            store,
                            order,
                            storeSettings,
                            partnerSubsidiary,
                            storeCustomer,
                        } = await createUserWithBusinessAndCustomerOrders(
                            {
                                createPartnerSubsidiary: true,
                            },
                            {
                                serviceOrder: {
                                    orderType: ORDER_TYPES.RESIDENTIAL,
                                    status: statuses.IN_TRANSIT_TO_STORE,
                                },
                            },
                        );
                        await factory.create(FN.orderActivityLog, {
                            orderId: serviceOrder.id,
                            status: statuses.READY_FOR_PROCESSING,
                        });
                        const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
                            orderId: serviceOrder.id,
                        });
                        const referenceItem = await factory.create(FN.serviceReferenceItem, {
                            orderItemId: serviceOrderItem.id,
                        });
                        await factory.create(FN.serviceReferenceItemDetailForServicePrice, {
                            serviceReferenceItemId: referenceItem.id,
                            soldItemType: 'InventoryItem',
                            lineItemTotalCost: referenceItem.quantity * referenceItem.unitCost,
                            lineItemUnitCost: referenceItem.unitCost,
                            category: 'FIXED_PRICE',
                            lineItemMinQuantity: 1,
                            lineItemMinPrice: 10,
                        });
                        const { token, customerauthtoken } = createTokens(
                            serviceOrder,
                            centsCustomer,
                        );

                        // request
                        const response = await ChaiHttpRequestHelper.get(apiEndpoint, {
                            token,
                        }).set({
                            customerauthtoken,
                        });

                        // assert
                        defaultAssert(
                            response,
                            serviceOrder,
                            order,
                            store,
                            storeSettings,
                            storeCustomer,
                            centsCustomer,
                        );
                        expect(response.body.order).have.property(
                            'orderType',
                            ORDER_TYPES.RESIDENTIAL,
                        );
                        expect(response.body.order).have.property('tipOption', ``);
                        expect(response.body.order)
                            .have.property('store')
                            .have.property('settings')
                            .have.property('tipType', '');
                        expect(response.body.order)
                            .have.property('timeline')
                            .have.property('step', 4);
                        expect(response.body.order)
                            .have.property('orderItems')
                            .to.be.an('array')
                            .lengthOf(1);
                        expect(response.body.order.orderItems[0]).have.property(
                            'orderItemId',
                            serviceOrderItem.id,
                        );
                        expect(response.body.order.orderItems[0]).have.property(
                            'hasMinPrice',
                            true,
                        );
                        expect(response.body.order.orderItems[0]).not.have.property('modifiers');
                        expect(response.body.order).have.property('subscription').to.be.an('object')
                            .is.empty;
                        expect(response.body.order).have.property('pickup').to.be.an('object').is
                            .empty;
                        expect(response.body.order).have.property('delivery').to.be.an('object').is
                            .empty;
                        expect(response.body.order).have.property('isIntakeComplete').to.be.true;
                        expect(response.body.order)
                            .have.property('subsidiary')
                            .have.property('id', partnerSubsidiary.id);
                        expect(response.body.order)
                            .have.property('latestPayment')
                            .to.be.an('object').is.empty;
                    });
                });
            });
        });
    });

    it('should return unprovided error', async () => {
        sinon.stub(stripe.paymentMethods, 'retrieve').throws('Unprovided error');
        const { serviceOrder, centsCustomer } = await createUserWithBusinessAndCustomerOrders(
            {
                createPartnerSubsidiary: true,
            },
            {
                serviceOrder: {
                    orderType: ORDER_TYPES.RESIDENTIAL,
                },
            },
        );
        const { token, customerauthtoken } = createTokens(serviceOrder, centsCustomer);

        // request
        const response = await ChaiHttpRequestHelper.get(apiEndpoint, {
            token,
        }).set({
            customerauthtoken,
        });

        // assert
        response.should.have.status(500);
        expect(response.body).have.property('error', 'Something went wrong!');
    });
});

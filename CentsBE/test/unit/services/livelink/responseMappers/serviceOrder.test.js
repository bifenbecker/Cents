require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const {
    getCurrentPayment,
    mapServiceOrder,
} = require('../../../../../services/liveLink/responseMappers/serviceOrder');
const sinon = require('sinon');
const stripe = require('../../../../../stripe/stripeWithSecret');
const { createServiceOrderWithLineItemAndModifier } = require('../../../../support/serviceOrderTestHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const ServiceOrder = require('../../../../../models/serviceOrders');

describe('test serviceOrder', () => {
    describe('test getCurrentPayment Function', () => {
        let stripePaymentMethodsRetrieveStub;
        const testStripePaymentMethod = 'pm_123xxxxxxxxxxxxx';
        const testLast4 = 1234;
        const testBrand = 'Visa';
        const paymentMethodRes = {
            card: {
                last4: testLast4,
                brand: testBrand,
            },
            id: 42,
        };
        beforeEach(async () => {
            stripePaymentMethodsRetrieveStub = sinon
                .stub(stripe.paymentMethods, 'retrieve')
                .withArgs(testStripePaymentMethod)
                .returns(paymentMethodRes);
        });

        it('should have latestPayment with requires_confirmation status in the response', async () => {
            const stripePaymentIntentsRetrieveStub = sinon
                .stub(stripe.paymentIntents, 'retrieve')
                .withArgs('pi_123xxxxxxxxxxxxx')
                .returns({
                    payment_method: testStripePaymentMethod,
                    status: 'requires_confirmation',
                });

            const res = await getCurrentPayment([
                {
                    status: 'requires_confirmation',
                    paymentToken: 'pi_123xxxxxxxxxxxxx',
                    totalAmount: 10,
                    id: 2,
                },
                {
                    status: 'succeeded',
                    paymentToken: 'pi_345xxxxxxxxxxxxx',
                    totalAmount: 10,
                    id: 1,
                },
            ]);

            sinon.assert.calledWith(stripePaymentIntentsRetrieveStub, 'pi_123xxxxxxxxxxxxx');
            sinon.assert.calledWith(stripePaymentMethodsRetrieveStub, testStripePaymentMethod);
            expect(res).to.deep.eq({
                id: 2,
                paymentMethod: {
                    paymentMethodToken: paymentMethodRes ? paymentMethodRes.id : null,
                    brand: paymentMethodRes ? paymentMethodRes.card.brand : null,
                    last4: paymentMethodRes ? paymentMethodRes.card.last4 : null,
                    provider: 'stripe',
                },
                status: 'requires_confirmation',
                paymentToken: 'pi_123xxxxxxxxxxxxx',
                totalAmount: 10,
            });
        });

        it('should return lastest payment if there are no pending payments', async () => {
            const stripePaymentIntentsRetrieveStub = sinon
                .stub(stripe.paymentIntents, 'retrieve')
                .withArgs('pi_123xxxxxxxxxxxxx')
                .returns({
                    payment_method: testStripePaymentMethod,
                    status: 'succeeded',
                });

            const res = await getCurrentPayment([
                {
                    status: 'succeeded',
                    paymentToken: 'pi_123xxxxxxxxxxxxx',
                    totalAmount: 10,
                    id: 2,
                },
                {
                    status: 'succeeded',
                    paymentToken: 'pi_345xxxxxxxxxxxxx',
                    totalAmount: 10,
                    id: 1,
                },
            ]);

            sinon.assert.calledWith(stripePaymentIntentsRetrieveStub, 'pi_123xxxxxxxxxxxxx');
            sinon.assert.calledWith(stripePaymentMethodsRetrieveStub, testStripePaymentMethod);
            expect(res).to.deep.eq({
                id: 2,
                paymentMethod: {
                    paymentMethodToken: paymentMethodRes ? paymentMethodRes.id : null,
                    brand: paymentMethodRes ? paymentMethodRes.card.brand : null,
                    last4: paymentMethodRes ? paymentMethodRes.card.last4 : null,
                    provider: 'stripe',
                },
                status: 'succeeded',
                paymentToken: 'pi_123xxxxxxxxxxxxx',
                totalAmount: 10,
            });
        });

        it('should handle undefined card object response', async () => {
            const stripePaymentIntentsRetrieveStub = sinon
                .stub(stripe.paymentIntents, 'retrieve')
                .withArgs('pi_123xxxxxxxxxxxxx')
                .returns({
                    payment_method: testStripePaymentMethod,
                    status: 'succeeded',
                });

            const paymentMethodRes = {
                card: undefined,
                id: 42,
            };

            // arrange
            stripePaymentMethodsRetrieveStub.returns(paymentMethodRes);
            // act
            const res = await getCurrentPayment([
                {
                    status: 'succeeded',
                    paymentToken: 'pi_123xxxxxxxxxxxxx',
                    totalAmount: 10,
                    id: 2,
                },
            ]);

            // assert
            sinon.assert.calledWith(stripePaymentIntentsRetrieveStub, 'pi_123xxxxxxxxxxxxx');
            sinon.assert.calledWith(stripePaymentMethodsRetrieveStub, testStripePaymentMethod);
            expect(res).to.deep.eq({
                id: 2,
                paymentMethod: {
                    paymentMethodToken: paymentMethodRes.id,
                    brand: null,
                    last4: null,
                    provider: 'stripe',
                },
                status: 'succeeded',
                paymentToken: 'pi_123xxxxxxxxxxxxx',
                totalAmount: 10,
            });
        });
    });

    describe('test mapServiceOrder inside responseMappers for live link', () => {
        let business, store;

        beforeEach(async () => {
            business = await factory.create(FN.laundromatBusiness);
            store = await factory.create(FN.store, {
                businessId: business.id,
            });
        });

        it('should return mapped order response for ServiceOrder with ServicePrices line item and modifier line items', async () => {
            const factoryOrderDetails = await createServiceOrderWithLineItemAndModifier(business.id, store.id);
            const {
                servicePrice,
                serviceOrder,
                serviceOrderItem,
                serviceReferenceItemDetail,
                serviceReferenceItemDetailModifier,
                order,
                serviceModifier,
            } = factoryOrderDetails;

            const orderQueryResults = await ServiceOrder.query()
                .where(`${ServiceOrder.tableName}.id`, serviceOrder.id)
                .withGraphJoined(
                    `[orderItems.[referenceItems as refItem.[servicePrice, inventoryItem,
                        lineItemDetail as li.[modifierLineItems as ml]]],
                        storeCustomer.[centsCustomer.[paymentMethods]],
                        store.[settings],
                        hub,
                        weightLogs,
                        order as parentOrder.[promotionDetails, delivery, pickup, payments as payment],
                        activityLog,
                        serviceOrderRecurringSubscription as subscription.[recurringSubscription]
                    ]`,
                )
                .first();

            const result = await mapServiceOrder(orderQueryResults);

            expect(result.orderId).to.equal(serviceOrder.id);
            expect(result.masterOrderId).to.equal(order.id);
            expect(result.netOrderTotal).to.equal(Number(Number(serviceOrder.netOrderTotal).toFixed(2)));
            expect(result.balanceDue).to.equal(Number(Number(serviceOrder.balanceDue).toFixed(2)));
            expect(result.paymentStatus).to.equal(serviceOrder.paymentStatus);
            expect(result.store.id).to.equal(store.id);
            expect(result.store.settings).to.not.be.undefined;
            expect(result.orderItems.length).to.equal(1);
            expect(result.orderItems[0].orderItemId).to.equal(serviceOrderItem.id);
            expect(result.orderItems[0].count).to.equal(serviceReferenceItemDetail.lineItemQuantity);
            expect(result.orderItems[0].itemTotal).to.equal(serviceReferenceItemDetail.lineItemTotalCost);
            expect(result.orderItems[0].price).to.equal(serviceReferenceItemDetail.lineItemUnitCost);
            expect(result.orderItems[0].laundryType).to.equal(serviceReferenceItemDetail.lineItemName);
            expect(result.orderItems[0].servicePriceId).to.equal(servicePrice.id);
            expect(result.orderItems[0].category).to.equal(serviceReferenceItemDetail.category);
            expect(result.orderItems[0].pricingType).to.equal(serviceReferenceItemDetail.pricingType);
            expect(result.orderItems[0].modifierLineItems).to.not.be.undefined;
            expect(result.orderItems[0].modifierLineItems.length).to.equal(1);
            expect(result.orderItems[0].modifierLineItems[0].id).to.equal(serviceReferenceItemDetailModifier.id);
            expect(result.orderItems[0].modifierLineItems[0].serviceReferenceItemDetailId).to.equal(serviceReferenceItemDetail.id);
            expect(result.orderItems[0].modifierLineItems[0].modifierId).to.equal(serviceReferenceItemDetailModifier.modifierId);
            expect(result.orderItems[0].modifierLineItems[0].modifierName).to.equal(serviceReferenceItemDetailModifier.modifierName);
            expect(result.orderItems[0].modifierLineItems[0].unitCost).to.equal(serviceReferenceItemDetailModifier.unitCost);
            expect(result.orderItems[0].modifierLineItems[0].quantity).to.equal(serviceReferenceItemDetailModifier.quantity);
            expect(result.orderItems[0].modifierLineItems[0].totalCost).to.equal(serviceReferenceItemDetailModifier.totalCost);
            expect(result.orderItems[0].modifierLineItems[0].modifierPricingType).to.equal(serviceReferenceItemDetailModifier.modifierPricingType);
            expect(result.orderItems[0].modifierLineItems[0].serviceModifierId).to.equal(serviceModifier.id);
        });
    });
});

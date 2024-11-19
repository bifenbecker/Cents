require('../../../testHelper');
const factory = require('../../../factories');
const { expect, chai } = require('../../../support/chaiHelper');
const {
    assertPostResponseSuccess,
    assertPostResponseError,
} = require('../../../support/httpRequestsHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { paymentStatuses } = require('../../../../constants/constants');
const { generateToken } = require('../../../support/apiTestHelper');
const sinon = require('sinon');
const LdClient = require('../../../../launch-darkly/LaunchDarkly');
const updateOrderStatusEndpoint = '/api/v1/employee-tab/home/order/update';
const ServiceOrder = require('../../../../models/serviceOrders')
const StoreSettings = require('../../../../models/storeSettings');
const eventEmitter = require('../../../../config/eventEmitter');
const updateOrderStatusModule = require('../../../../pipeline/employeeApp/serviceOrder/updateOrderStatusPipeline');

describe('test Update Order Status api', async () => {

    describe('without auth token', async () => {
        it('should return unauthorized', async () => {
            await assertPostResponseError({
                url: updateOrderStatusEndpoint,
                token: '',
                code: 401,
                expectedError: 'Please sign in to proceed.',
            });
        });
    });

    describe('with auth token', async () => {
        let centsCustomer, business, store, storeCustomer, serviceOrder, token, payload, order;
        beforeEach(async () => {
            centsCustomer = await factory.create(FN.centsCustomer);
            business = await factory.create(FN.laundromatBusiness);
            store = await factory.create('store', {
                businessId: business.id,
            });
            await StoreSettings
                .query()
                .findOne({ storeId: store.id })
                .patch({ timeZone: 'America/Los_Angeles' });
            storeCustomer = await factory.create(FN.storeCustomer, {
                centsCustomerId: centsCustomer.id,
                storeId: store.id,
                businessId: store.businessId,
            });
            serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                storeCustomerId: storeCustomer.id,
                status: 'PROCESSING',
                balanceDue: 20,
                orderTotal: 20,
                paymentToken: 'cash'
            });
            await ServiceOrder.query().patch({ balanceDue: 0 }).where('id', serviceOrder.id)
            order = await factory.create(FN.order, {
                orderableId: serviceOrder.id,
                orderableType: 'ServiceOrder'
            });
            token = generateToken({
                id: store.id,
            });

            payload = {
                id: serviceOrder.id,
                status: 'READY_FOR_PICKUP',
            };
        });

        describe('test indexCustomer event emitting', () => {
            
            it('should emit the indexCustomer event', async () => {
                const spy = chai.spy(() => { });
                eventEmitter.once('indexCustomer', spy);
             
                sinon.stub(updateOrderStatusModule, 'updateOrderStatusPipeline')
                await assertPostResponseSuccess({ token, url: updateOrderStatusEndpoint, body: { ...payload } });
                expect(spy).to.have.been.called.with(serviceOrder.storeCustomerId);
            })
        })

        describe('order with recurring subscription', async () => {
            let recurringSubscription, centsCustomerAddress;
            beforeEach(async () => {
                centsCustomerAddress = await factory.create(FN.centsCustomerAddress, {
                    centsCustomerId: centsCustomer.id,
                });
                recurringSubscription = await factory.create(FN.recurringSubscription, {
                    storeId: store.id,
                    centsCustomerAddressId: centsCustomerAddress.id,
                });
                await factory.create(FN.serviceOrderRecurringSubscription, {
                    serviceOrderId: serviceOrder.id,
                    recurringSubscriptionId: recurringSubscription.id,
                    recurringDiscountInPercent: 100,
                });
            });

            describe('when current time is less than delivery time', async () => {
                beforeEach(async () => {
                    await factory.create(FN.orderDelivery, {
                        orderId: order.id,
                        type: 'RETURN',
                        status: 'INTENT_CREATED',
                    });
                })
                describe('when subscription-removal-fix flag is turned on', async () => {
                    beforeEach(async () => {
                        sinon.stub(LdClient, 'evaluateFlag').withArgs('subscription-removal-fix').returns(true);
                    });

                    it('should calculate recurring discount in cents', async () => {
                        const { body } = await assertPostResponseSuccess({ token, url: updateOrderStatusEndpoint, body: { ...payload } });
                        const updatedOrderDetails = body.orderDetails;
                        expect(body).to.have.property('success').equal(true);
                        expect(updatedOrderDetails).to.have.property('recurringDiscountInCents').equal(2000);
                        expect(updatedOrderDetails).to.have.property('status').equal('READY_FOR_DRIVER_PICKUP');
                        expect(updatedOrderDetails).to.have.property('subscription').to.not.be.empty;
                    });
                });

                describe('when subscription-removal-fix flag is turned off', async () => {
                    beforeEach(async () => {
                        sinon.stub(LdClient, 'evaluateFlag').withArgs('subscription-removal-fix').returns(false);
                    });

                    it('should not calculate recurring discount', async () => {
                        // setting order total to 0 to skip stripe api calls(uows) until we write test for pipeline
                        await ServiceOrder.query().patch({ orderTotal: 0 }).where('id', serviceOrder.id)
                        const { body } = await assertPostResponseSuccess({ token, url: updateOrderStatusEndpoint, body: { ...payload } });
                        const updatedOrderDetails = body.orderDetails;
                        expect(body).to.have.property('success').equal(true);
                        expect(updatedOrderDetails).to.have.property('recurringDiscountInCents').equal(0);
                        expect(updatedOrderDetails).to.have.property('subscription').to.not.be.empty;
                    });
                });
            })

        });

        describe('Order without recurring subscription', async () => {

            describe('when current time is less than delivery time', async () => {
                beforeEach(async () => {
                    // setting order total to 0 to skip stripe api calls(uows) until we write test for pipeline
                    await ServiceOrder.query().patch({ orderTotal: 0 }).where('id', serviceOrder.id)
                    await factory.create(FN.orderDelivery, {
                        orderId: order.id,
                        type: 'RETURN',
                        status: 'INTENT_CREATED',
                    });
                });

                describe('when subscription-removal-fix flag is turned on', async () => {
                    beforeEach(async () => {
                        sinon.stub(LdClient, 'evaluateFlag').withArgs('subscription-removal-fix').returns(true);
                    });
                    it('should return recurring discount in cents as 0', async () => {
                        const { body } = await assertPostResponseSuccess({ token, url: updateOrderStatusEndpoint, body: { ...payload } });
                        const updatedOrderDetails = body.orderDetails;
                        expect(body).to.have.property('success').equal(true);
                        expect(updatedOrderDetails).to.have.property('recurringDiscountInCents').equal(0);
                        expect(updatedOrderDetails).to.have.property('subscription').to.be.empty;
                    });
                });

                describe('when subscription-removal-fix flag is turned off', async () => {
                    beforeEach(async () => {
                        sinon.stub(LdClient, 'evaluateFlag').withArgs('subscription-removal-fix').returns(false);
                    });
                    it('should return recurring discount in cents as 0', async () => {
                        const { body } = await assertPostResponseSuccess({ token, url: updateOrderStatusEndpoint, body: { ...payload } });
                        const updatedOrderDetails = body.orderDetails;
                        expect(body).to.have.property('success').equal(true);
                        expect(updatedOrderDetails).to.have.property('recurringDiscountInCents').equal(0);
                        expect(updatedOrderDetails).to.have.property('subscription').to.be.empty;
                    });
                });
            });

            describe('when current time is greater than delivery time', async () => {
                beforeEach(async () => {
                    await factory.create('orderDelivery', {
                        orderId: order.id,
                        type: 'RETURN',
                        status: 'INTENT_CREATED',
                        deliveryWindow: ['1619625878000', '1619625878000']
                    });
                });

                it('should return recurring discount in cents as 0', async () => {
                    const { body } = await assertPostResponseSuccess({ token, url: updateOrderStatusEndpoint, body: { ...payload } });
                    const updatedOrderDetails = body.orderDetails;
                    expect(body).to.have.property('success').equal(true);
                    expect(updatedOrderDetails).to.have.property('recurringDiscountInCents').equal(0);
                });
            });
        });

        describe('Check payment status', async () => {
            describe('Check INVOICING status', async () => {
                beforeEach(async () => {
                    await ServiceOrder.query().patch({ paymentStatus: paymentStatuses.INVOICING, balanceDue: 20  }).where('id', serviceOrder.id);
                });

                it('should return INVOICING payment status for INVOICING orders', async () => {
                    const { body } = await assertPostResponseSuccess({ token, url: updateOrderStatusEndpoint, body: { ...payload } });
                    const updatedOrderDetails = body.orderDetails;
                    expect(body).to.have.property('success').equal(true);
                    expect(updatedOrderDetails).to.have.property('paymentStatus').equal(paymentStatuses.INVOICING);
                });
            });

            describe('Check PAID status', async () => {
                beforeEach(async () => {
                    await ServiceOrder.query().patch({ paymentStatus: paymentStatuses.INVOICING, balanceDue: 0  }).where('id', serviceOrder.id);
                });

                it('should return PAID payment status if balance due is 0', async () => {
                    const { body } = await assertPostResponseSuccess({ token, url: updateOrderStatusEndpoint, body: { ...payload } });
                    const updatedOrderDetails = body.orderDetails;
                    expect(body).to.have.property('success').equal(true);
                    expect(updatedOrderDetails).to.have.property('paymentStatus').equal(paymentStatuses.PAID);
                });
            });

            describe('Check BALANCE_DUE status', async () => {
                beforeEach(async () => {
                    await ServiceOrder.query().patch({ paymentStatus: paymentStatuses.BALANCE_DUE, balanceDue: 20  }).where('id', serviceOrder.id);
                });

                it('should return BALANCE_DUE payment status if balance due is 0', async () => {
                    const { body } = await assertPostResponseSuccess({ token, url: updateOrderStatusEndpoint, body: { ...payload } });
                    const updatedOrderDetails = body.orderDetails;
                    expect(body).to.have.property('success').equal(true);
                    expect(updatedOrderDetails).to.have.property('paymentStatus').equal(paymentStatuses.BALANCE_DUE);
                });
            });
        });
    });
});

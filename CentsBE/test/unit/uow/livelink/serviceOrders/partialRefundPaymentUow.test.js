require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const partialRefundPaymentUow = require('../../../../../uow/liveLink/serviceOrders/partialRefundPaymentUow');
const factory = require('../../../../factories');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');

const sinon = require('sinon');
const stripe = require('../../../../../stripe/stripeWithSecret');
const { CREATE_STRIPE_REFUND, CREATE_STRIPE_INTENT_RESPONSE } = require('../../../../constants/responseMocks');
const CreditHistory = require('../../../../../models/creditHistory');

describe('test partial refund', () => {
    let payload;

    describe('when refundable amount is 0', () => {
        payload = {
            refundableAmount: 0,
        }
        it('should not refund payment', async () => {
            const partialRefundPayment = await partialRefundPaymentUow(payload);
            expect(partialRefundPayment).to.not.have.property('refundedPayment');
            expect(partialRefundPayment).to.not.have.property('stripeRefund');
        });
    });

    describe('when refundable amount is greater than 0', () => {
        beforeEach(async () => {
            await factory.create('store');
            const {
                store,
                centsCustomer,
                storeCustomer,
                serviceOrder,
                order,
            } = await createUserWithBusinessAndCustomerOrders();
            payload = {
                deliveryFeeDifference: 2,
                order,
                customer: centsCustomer,
                store,
                storeCustomer,
                serviceOrder,
            };
        });
    
        afterEach(() => {
            sinon.restore();
        });
    
        describe('with succeeded payment', () => {
            let stripeRefundStub, succeededPayment
            beforeEach(async () => {
                payload.refundableAmount = 2;
                payload.chargableAmount = 1;
    
                stripeRefundStub = sinon
                    .stub(stripe.refunds, 'create')
                    .callsFake(() => CREATE_STRIPE_REFUND);
    
                succeededPayment = await factory.create('payments', {
                    orderId: payload.order.id,
                    paymentToken: CREATE_STRIPE_INTENT_RESPONSE.id,
                    totalAmount: Number(CREATE_STRIPE_INTENT_RESPONSE.amount) / 100,
                    storeCustomerId: payload.storeCustomer.id,
                    storeId: payload.store.id,
                    status: 'succeeded'
                });
            });
    
            describe('with no refunded payment', () => {
                it('should do partial refund with succeeded payment', async () => {
                    const partialRefundPayment = await partialRefundPaymentUow(payload);
                    expect(partialRefundPayment).to.have.property('refundedPayment').to.have.property('status').equal('refunded');
                    expect(partialRefundPayment).to.have.property('refundedPayment').to.have.property('totalAmount').equal(2);
                    expect(partialRefundPayment).to.have.property('stripeRefund').to.not.be.empty;
                    sinon.assert.calledOnce(stripeRefundStub);
                });
            });
    
            describe('With refunded payment', () => {
                it('should do partial refund with succeeded and refunded payment', async () => {
                    await factory.create('payments', {
                        orderId: payload.order.id,
                        paymentToken: CREATE_STRIPE_INTENT_RESPONSE.id,
                        totalAmount: 1,
                        storeCustomerId: payload.storeCustomer.id,
                        storeId: payload.store.id,
                        status: 'refunded',
                        parentId: succeededPayment.id
                    });
                    const partialRefundPayment = await partialRefundPaymentUow(payload);
                    expect(partialRefundPayment).to.have.property('refundedPayment').to.have.property('status').equal('refunded');
                    expect(partialRefundPayment).to.have.property('refundedPayment').to.have.property('totalAmount').equal(2);
                    expect(partialRefundPayment).to.have.property('stripeRefund').to.not.be.empty;
                    sinon.assert.calledOnce(stripeRefundStub);
                });
            });
        });
    
        describe('with no succeeded payment', () => {
            it('should add credits', async () => {
                const addCredits = await partialRefundPaymentUow(payload);
                const creditHistory = await CreditHistory.query()
                .findOne({
                    customerId: payload.customer.id,
                    businessId: payload.store.businessId,
                    isDeleted: false,
                })
                .orderBy('id', 'desc');
                expect(addCredits).to.not.have.property('refundedPayment');
                expect(addCredits).to.not.have.property('stripeRefund');
                expect(creditHistory).to.have.property('amount').equal(2);
            });
        });
    });
});
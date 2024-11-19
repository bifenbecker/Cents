require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const StripeErrorHandler = require('../../../../../uow/delivery/dropoff/StripeErrorHandler');
const factory = require('../../../../factories');
const { paymentStatuses } = require('../../../../../constants/constants');
const Payment = require('../../../../../models/payment');
const ServiceOrder = require('../../../../../models/serviceOrders');

const createServiceOrder = ({
    storeId,
    paymentStatus
}) => {
    return factory.create('serviceOrder', {
        storeId,
        paymentStatus,
        balanceDue: 10,
        netOrderTotal: 10,
        orderTotal: 10
    })
}

const createOrder = ({
    storeId, orderableId, orderableType
}) => {
    return factory.create('order', {
        storeId,
        orderableId,
        orderableType
    })
}

const createPayment = ({
    orderId,
    storeId
}) => {
    return factory.create('payments', {
        orderId,
        storeId
    })
}

const fetchPayment = (paymentId) => {
    return Payment.query().findById(paymentId)
}

const fetchServiceOrder = (serviceOrderId) => {
    return ServiceOrder.query().findById(serviceOrderId)
}

describe('test StripeErrorHandler class', () => {
    describe('test isStripeError method', () => {
        let error;
        beforeEach(async () => {
            error = {
                type: 'StripeCardError'
            }
        })
        it('should return true if the error is of type stripe card error', async () => {
            const stripeErrorHandler = new StripeErrorHandler(error)
            const res = await stripeErrorHandler.isStripeError()
            expect(res).to.be.true
        })

        it('should return true if the error is of type stripe invalid request error', async () => {
            error.type = 'StripeInvalidRequestError'
            const stripeErrorHandler = new StripeErrorHandler(error)
            const res = await stripeErrorHandler.isStripeError()
            expect(res).to.be.true
        })

        it('should return true if the error is of type card error', async () => {
            error.type = 'card_error'
            const stripeErrorHandler = new StripeErrorHandler(error)
            const res = await stripeErrorHandler.isStripeError()
            expect(res).to.be.true
        })

        it('should return false if the error is not of type stripe error', async () => {
            error.type = 'randomError'
            const stripeErrorHandler = new StripeErrorHandler(error)
            const res = await stripeErrorHandler.isStripeError()
            expect(res).to.be.false
        })
    })

    describe('test updatePaymentErrorStatus method', () => {
        let error;
        let paymentId;
        let serviceOrderId;
        let storeId;
        beforeEach(async () => {
            error = {
                type: 'StripeCardError',
            }
            const store = await factory.create('store')
            storeId = store.id
            const serviceOrder = await createServiceOrder({
                storeId,
                paymentStaus: paymentStatuses.PENDING,
            })
            serviceOrderId = serviceOrder.id
            const order = await createOrder({
                storeId,
                orderableId: serviceOrder.id,
                orderableType: 'ServiceOrder'
            })
            const payment = await createPayment({
                orderId: order.id,
                storeId,
            })
            paymentId = payment.id
        })

        it('should return error if paymentId is not sent to the constructor', async () => {
            const stripeErrorHandler = new StripeErrorHandler(error)
            expect(stripeErrorHandler.updatePaymentErrorStatus()).to.be.rejectedWith('undefined passed to findById')
        })

        it('should return the error object if there is no payment found', async () => {
            const stripeErrorHandler = new StripeErrorHandler(error, 100)
            const res = await stripeErrorHandler.updatePaymentErrorStatus()
            expect(res).to.eql(error)
        })

        it('should return the error object and not update the serviceorder if not found', async () => {
            const order = await createOrder({
                storeId,
                orderableId: 100,
                orderableType: 'ServiceOrder'
            })
            const payment = await createPayment({
                orderId: order.id,
                storeId,
            })
            error.code = 'card_declined'
            const stripeErrorHandler = new StripeErrorHandler(error, payment.id)
            const res = await stripeErrorHandler.updatePaymentErrorStatus()
            const updatedPaymnet = await fetchPayment(payment.id)
            expect(updatedPaymnet).to.have.property('status').to.equal('card_declined')
            expect(res).to.eql(error)
        })

        describe('with raw object in the error', () => {
            
            it('should update the payment status to error raw.code if there is raw key in the error object', async () => {
                error.raw = {
                    code: 'insufficient_funds'
                }
                const stripeErrorHandler = new StripeErrorHandler(error, paymentId)
                await stripeErrorHandler.updatePaymentErrorStatus()
                expect(await fetchPayment(paymentId)).to.have.property('status').to.equal('insufficient_funds')
            })

            it('should update the payment status to raw.decline_code if there is raw key in the error object', async () => {
                error.raw = {
                    decline_code: 'insufficient_funds'
                }
                const stripeErrorHandler = new StripeErrorHandler(error, paymentId)
                await stripeErrorHandler.updatePaymentErrorStatus()
                expect(await fetchPayment(paymentId)).to.have.property('status').to.equal('insufficient_funds')
            })
        })

        describe('with out raw object in the error', () => {
            it('should update the payment status to error.code if there is no raw object', async () => {
                error.code = 'insufficient_funds'
                const stripeErrorHandler = new StripeErrorHandler(error, paymentId)
                await stripeErrorHandler.updatePaymentErrorStatus()
                expect(await fetchPayment(paymentId)).to.have.property('status').to.equal('insufficient_funds')
            })
    
            it('should update the payment status to error.decline_code if there is no raw object and no code in error object', async () => {
                error.decline_code = 'insufficient_funds'
                const stripeErrorHandler = new StripeErrorHandler(error, paymentId)
                await stripeErrorHandler.updatePaymentErrorStatus()
                expect(await fetchPayment(paymentId)).to.have.property('status').to.equal('insufficient_funds')
            })
    
            it('should update the serviceOrder payment status to balance due', async () => {
                error.code = 'insufficient_funds'
                const stripeErrorHandler = new StripeErrorHandler(error, paymentId)
                await stripeErrorHandler.updatePaymentErrorStatus()
                const serviceOrder = await fetchServiceOrder(serviceOrderId)
                expect(serviceOrder).to.have.property('paymentStatus').to.equal(paymentStatuses.BALANCE_DUE)
            })
        })
    })
})
require('../../../../testHelper');
const sinon = require('sinon');
const factory = require('../../../../factories');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const { expect, assert } = require('../../../../support/chaiHelper');
const StripePayment = require('../../../../../services/stripe/stripePayment');
const ServiceOrderQuery = require('../../../../../services/queries/serviceOrder');
const cancelDuplicatePendingPayment = require('../../../../../uow/order/serviceOrder/cancelDuplicatePendingPayment');
const { PAYMENT_INTENT_STATUSES } = require('../../../../constants/statuses');
const { paymentStatuses } = require('../../../../../constants/constants');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const {
    CREATE_STRIPE_INTENT_RESPONSE,
    CANCEL_STRIPE_INTENT_RESPONSE,
} = require('../../../../constants/responseMocks');

let payload;
let paymentData;
describe('test cancelDuplicatePendingPayment UoW', () => {
    beforeEach(async () => {
        const { laundromatBusiness, store, storeCustomer, serviceOrder, order } =
            await createUserWithBusinessAndCustomerOrders(
                { createPartnerSubsidiary: true },
                {
                    serviceOrder: { paymentStatus: paymentStatuses.PAID, netOrderTotal: 0 },
                },
            );

        const applicationFee = 0.6;
        const amount = serviceOrder.netOrderTotal;
        const stripePaymentIntent = Object.assign(CREATE_STRIPE_INTENT_RESPONSE, {
            amount,
            amount_received: amount,
        });
        paymentData = {
            customerId: null,
            orderId: order.id,
            storeCustomerId: storeCustomer.id,
            storeId: store.id,
            status: PAYMENT_INTENT_STATUSES.succeeded,
            totalAmount: Number(amount),
            transactionFee: applicationFee,
            tax: 0,
            paymentToken: stripePaymentIntent.id,
            stripeClientSecret: stripePaymentIntent.client_secret,
            currency: 'usd',
            destinationAccount: laundromatBusiness.merchantId,
            paymentProcessor: 'stripe',
            appliedAmount: Number(amount),
            unappliedAmount: 0,
        };
        await factory.create(FN.payment, paymentData);

        payload = {
            serviceOrderId: serviceOrder.id,
            serviceOrder,
        };
    });

    it('should return unaltered payload if duplicate Payment is not existing', async () => {
        // call Uow
        const newPayload = await cancelDuplicatePendingPayment(payload);

        // assert
        assert.deepEqual(newPayload, payload, 'return unaltered payload');
    });

    it('should return unaltered payload and cancel existing duplicate Payment', async () => {
        await factory.create(FN.payment, {
            ...paymentData,
            status: PAYMENT_INTENT_STATUSES.requiresConfirmation,
        });
        sinon
            .stub(StripePayment.prototype, 'cancelPaymentIntent')
            .callsFake(() => CANCEL_STRIPE_INTENT_RESPONSE);

        // call Uow
        const newPayload = await cancelDuplicatePendingPayment(payload);
        const serviceOrderQuery = new ServiceOrderQuery(payload.serviceOrderId);
        const payments = await serviceOrderQuery.fetchPayments();

        // assert
        assert.deepEqual(newPayload, payload, 'return unaltered payload');
        expect(payments, 'should cancel duplicate payment').to.satisfy((payments) =>
            payments.every(
                (payment) => payment.status !== PAYMENT_INTENT_STATUSES.requiresConfirmation,
            ),
        );
    });
});

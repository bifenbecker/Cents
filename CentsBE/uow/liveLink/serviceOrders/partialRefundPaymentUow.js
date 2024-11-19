const { find, sumBy } = require('lodash');

const stripe = require('../../../stripe/stripeWithSecret');
const Payment = require('../../../models/payment');
const Business = require('../../../models/laundromatBusiness');

const addCreditHistory = require('./addCreditHistory');

const getSucceededPaymentForRefund = async (orderId, deliveryFeeDifference, transaction) => {
    const latestPayments = await Payment.query(transaction)
        .withGraphFetched('paymentRefunds')
        .where({
            orderId,
            status: 'succeeded',
        })
        .orderBy('id', 'desc');

    return find(
        latestPayments,
        (payment) =>
            payment.totalAmount >= deliveryFeeDifference &&
            (payment.paymentRefunds.length
                ? sumBy(payment.paymentRefunds, 'totalAmount') < deliveryFeeDifference
                : true),
    );
};

async function issueCredits(payload) {
    payload.amount = payload.deliveryFeeDifference;
    return addCreditHistory(payload);
}

async function createRefundPaymentRecord(payload, succeededPayment) {
    const { transaction, order, serviceOrder, store, deliveryFeeDifference } = payload;

    const business = await Business.query(transaction).findById(store.businessId);
    return Payment.query(transaction)
        .insert({
            orderId: order.id,
            status: 'refunded',
            paymentProcessor: 'stripe',
            storeCustomerId: serviceOrder.storeCustomerId,
            storeId: serviceOrder.storeId,
            totalAmount: Number(deliveryFeeDifference),
            transactionFee: 0,
            tax: 0,
            paymentToken: succeededPayment.paymentToken,
            stripeClientSecret: succeededPayment.stripeClientSecret,
            currency: 'usd',
            destinationAccount: business.merchantId,
            appliedAmount: Number(deliveryFeeDifference),
            unappliedAmount: 0,
            parentId: succeededPayment.id,
        })
        .returning('*');
}

async function issueRefundInStripe(paymentToken, amount) {
    try {
        return stripe.refunds.create({
            payment_intent: paymentToken,
            reverse_transfer: false,
            reason: 'requested_by_customer',
            amount: Number((amount * 100).toFixed(0)),
        });
    } catch (error) {
        throw Error(error.message);
    }
}

const partialRefundPaymentUow = async (payload) => {
    try {
        const newPayload = payload;
        const { transaction, order, refundableAmount } = newPayload;

        if (refundableAmount === 0) return payload;

        const succeededPayment = await getSucceededPaymentForRefund(
            order.id,
            refundableAmount,
            transaction,
        );
        if (!succeededPayment) {
            return issueCredits(payload);
        }

        const refundPayment = await createRefundPaymentRecord(payload, succeededPayment);

        const stripeRefund = await issueRefundInStripe(
            succeededPayment.paymentToken,
            refundableAmount,
        );

        newPayload.refundedPayment = refundPayment;
        newPayload.stripeRefund = stripeRefund;
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = partialRefundPaymentUow;

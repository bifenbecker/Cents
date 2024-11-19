require('dotenv').config();

const stripe = require('../../../stripe/stripeWithSecret');

const Business = require('../../../models/laundromatBusiness');
const Payment = require('../../../models/payment');
const logger = require('../../../lib/logger');
const StripeErrorHandler = require('./StripeErrorHandler');

/**
 * Create a Stripe PaymentIntent and Payment in our backend for the order's balanceDue.
 *
 * Skip this UoW if:
 *
 * 1) payload contains pendingPayment (meaning we will instead update the payment); or
 * 2) balanceDue is 0 (meaning the update is free)
 *
 * @param {Object} payload
 */
async function createStripePaymentIntent(payload) {
    const newPayload = payload;

    try {
        const { transaction } = newPayload;

        const chargableAmount = newPayload.chargableAmount || newPayload.serviceOrder.balanceDue;
        if (newPayload.pendingPayment || chargableAmount < 0.5) {
            return newPayload;
        }

        const business = await Business.query().findById(newPayload.store.businessId);

        const balanceDue = Number(chargableAmount).toFixed(2);
        const stripeBalanceDue = Number(balanceDue * 100).toFixed(2);
        const finalStripeTotal = Number(stripeBalanceDue);

        if (!newPayload.paymentToken) {
            throw new Error('Please add new payment method');
        }
        const stripePaymentIntent = await stripe.paymentIntents.create({
            amount: finalStripeTotal,
            currency: 'usd',
            customer: newPayload.customer.stripeCustomerId,
            metadata: {
                orderId: newPayload.order.id,
                storeId: newPayload.store.id,
                customerEmail: newPayload.customer.email,
                orderableType: 'ServiceOrder',
                orderableId: newPayload.serviceOrder.id,
                storeCustomerId: newPayload.storeCustomer.id,
            },
            payment_method: newPayload.paymentToken,
            payment_method_types: ['card'],
            transfer_data: {
                destination: business.merchantId,
            },
            on_behalf_of: business.merchantId,
            application_fee_amount: Math.round(chargableAmount * 0.04 * 100),
            capture_method: 'manual',
        });
        const deliveryPayment = await Payment.query(transaction).insert({
            orderId: newPayload.order.id,
            storeCustomerId: newPayload.storeCustomer.id,
            storeId: newPayload.store.id,
            status: stripePaymentIntent.status,
            totalAmount: Number(stripePaymentIntent.amount / 100),
            transactionFee: Number(stripePaymentIntent.application_fee_amount / 100),
            tax: 0,
            paymentToken: stripePaymentIntent.id,
            stripeClientSecret: stripePaymentIntent.client_secret,
            currency: 'usd',
            destinationAccount: business.merchantId,
            paymentProcessor: 'stripe',
            appliedAmount: Number(stripePaymentIntent.amount / 100),
            unappliedAmount: 0,
        });

        newPayload.paymentModel = deliveryPayment;
        newPayload.business = business;
        newPayload.stripePaymentIntent = stripePaymentIntent;

        return newPayload;
    } catch (error) {
        logger.error(error);

        if (payload.isDeliveryOrder) {
            const handleStripeErrors = new StripeErrorHandler(error);
            if (handleStripeErrors.isStripeError()) {
                newPayload.isPaymentFailed = true;
                return newPayload;
            }
        }

        throw Error(error.message);
    }
}

module.exports = exports = createStripePaymentIntent;

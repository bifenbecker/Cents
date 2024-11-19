const Business = require('../../../models/laundromatBusiness');
const StripePayment = require('../../../services/stripe/stripePayment');

/**
 * Create a Stripe PaymentIntent and Payment in our backend for the pickup delivery
 *
 * The amount we pass into the Stripe PaymentIntent is fixed at $150
 * because this is simply a card pre-authorization.
 *
 * We will be updating the amount and application_fee_amount attributes
 * to reflect the order's balanceDue once we complete intake.
 *
 * newPayload must contain:
 *
 * 1) customer object - this is the CentsCustomer model
 * 2) storeCustomer object - this is the StoreCustomer model
 * 3) paymentToken - paymentToken of the card used - pm_1HfRfvGuj5YLpJjF7DCLy66x
 * 4) store - this is the Store model
 *
 * @param {Object} payload
 */
async function createStripePaymentIntent(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const business = await Business.query(transaction).findById(newPayload.store.businessId);

        const paymentIntentPayload = {
            amount: 15000,
            currency: 'usd',
            customer: newPayload.customer.stripeCustomerId,
            metadata: {
                storeId: newPayload.store.id,
                customerEmail: newPayload.customer.email,
                orderableType: 'ServiceOrder - pickup delivery order',
                storeCustomerId: newPayload.storeCustomer.id,
                orderableId: newPayload.serviceOrder.id,
            },
            payment_method: newPayload.paymentToken,
            payment_method_types: ['card'],
            transfer_data: {
                destination: business.merchantId,
            },
            on_behalf_of: business.merchantId,
            application_fee_amount: Math.round(15000 * 0.04),
            capture_method: 'manual',
        };
        const stripePaymentIntent = await StripePayment.createPaymentIntent(paymentIntentPayload);

        newPayload.business = business;
        newPayload.stripePaymentIntent = stripePaymentIntent;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createStripePaymentIntent;

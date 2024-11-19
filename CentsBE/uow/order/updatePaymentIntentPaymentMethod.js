const stripe = require('../../stripe/stripeWithSecret');
const ServiceOrderQuery = require('../../services/queries/serviceOrder');

async function updateStripePaymentIntentPaymentMethod(payload) {
    try {
        const { serviceOrderId, transaction, paymentToken } = payload;
        const serviceOrderQuery = new ServiceOrderQuery(serviceOrderId, transaction);
        const pendingPayment = await serviceOrderQuery.pendingPayment();

        if (pendingPayment) {
            const paymentIntent = await stripe.paymentIntents.retrieve(pendingPayment.paymentToken);
            await stripe.paymentIntents.update(paymentIntent.id, {
                payment_method: paymentToken || paymentIntent.payment_method,
            });
        }

        return payload;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = exports = updateStripePaymentIntentPaymentMethod;

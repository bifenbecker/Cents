const stripe = require('../../../stripe/stripeWithSecret');

// updating the intent not confirming it as it could be updated again in the order lifecycle.
async function updateStripePaymentIntent(payload) {
    const {
        existingIntent: { paymentToken },
        amount,
    } = payload;
    const intent = await stripe.paymentIntents.update(paymentToken, {
        amount: Math.floor(amount * 100),
        application_fee_amount: Math.floor(amount * 4), // 4 % of amount in cents.
    });
    return intent;
}

module.exports = exports = updateStripePaymentIntent;

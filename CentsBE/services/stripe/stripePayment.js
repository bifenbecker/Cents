require('dotenv').config();

const stripe = require('../../stripe/stripeWithSecret');

class StripePayment {
    constructor(paymentToken) {
        this.paymentToken = paymentToken;
    }

    retrievePaymentIntent() {
        return stripe.paymentIntents.retrieve(this.paymentToken);
    }

    cancelPaymentIntent() {
        return stripe.paymentIntents.cancel(this.paymentToken);
    }

    async confirmPaymentIntent() {
        this.paymentIntent = await this.retrievePaymentIntent();
        return stripe.paymentIntents.confirm(this.paymentIntent.id);
    }

    async capturePaymentIntent() {
        this.paymentIntent = await this.retrievePaymentIntent();
        if (this.paymentIntent.status === 'requires_capture') {
            return stripe.paymentIntents.capture(this.paymentIntent.id);
        }
        return null;
    }

    static createPaymentIntent(paymentIntentPayload) {
        return stripe.paymentIntents.create(paymentIntentPayload);
    }

    async retrievePaymentMethod() {
        return stripe.paymentMethods.retrieve(this.paymentToken);
    }
}

module.exports = exports = StripePayment;

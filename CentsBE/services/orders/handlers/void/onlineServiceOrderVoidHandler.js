const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const BaseVoidHandler = require('./baseHandler');
const getPendingPayment = require('../../queries/getPendingPaymentIntent');

class OnlineServiceOrderVoidHandler extends BaseVoidHandler {
    async handle() {
        // change order status to cancel
        await super.handle();

        // cancel payment intent
        await this.cancelPaymentIntent();
    }

    /**
     * @description This function cancels the payment intent created for the order
     */
    async cancelPaymentIntent() {
        // fetching the pending payment intent created for the order
        const payment = await getPendingPayment(this.serviceOrder.order.id, this.transaction);
        if (payment) {
            const paymentIntent = await stripe.paymentIntents.retrieve(payment.paymentToken);
            const cancelledPaymentIntent = await stripe.paymentIntents.cancel(paymentIntent.id);
            await payment.$query(this.transaction).patch({
                status: cancelledPaymentIntent.status,
            });
        }
    }
}

module.exports = exports = OnlineServiceOrderVoidHandler;

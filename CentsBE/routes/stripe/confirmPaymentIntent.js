const stripe = require('./config');
const updatePayment = require('../employeeTab/payment/updatePayment');
const capturePaymentIntent = require('./capturePaymentIntent');
const StripeErrorHandler = require('../../uow/delivery/dropoff/StripeErrorHandler');
const Payment = require('../../models/payment');

const confirmPaymentIntent = async (req, res, next) => {
    let paymentId = null;
    try {
        let payment = await Payment.query().findOne('paymentToken', req.body.id);
        paymentId = payment.id;

        const paymentIntent = await stripe.paymentIntents.confirm(req.body.id);

        if (paymentIntent.status === 'requires_capture') return capturePaymentIntent(req, res);

        payment = await updatePayment(paymentIntent);

        return res.json({
            success: true,
            paymentIntent,
            payment,
        });
    } catch (error) {
        if (paymentId) {
            const handleStripeErrors = new StripeErrorHandler(error, paymentId);
            if (handleStripeErrors.isStripeError()) {
                await handleStripeErrors.updatePaymentErrorStatus();
            }
        }
        return next(error);
    }
};

module.exports = exports = confirmPaymentIntent;

const stripe = require('./config');
const updatePayment = require('../employeeTab/payment/updatePayment');
const StripeErrorHandler = require('../../uow/delivery/dropoff/StripeErrorHandler');

const capturePaymentIntent = async (req, res, next) => {
    let paymentId;
    try {
        const paymentIntent = await stripe.paymentIntents.capture(req.body.id);
        const payment = await updatePayment(paymentIntent);
        paymentId = payment.id || null;
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

module.exports = exports = capturePaymentIntent;

const isEmpty = require('lodash/isEmpty');
const StripeErrorHandler = require('../../uow/delivery/dropoff/StripeErrorHandler');

// Pipeline
const createPaymentIntentPipeline = require('../../pipeline/stripe/employeeTab/createPaymentIntentPipeline');

/**
 * Create a Stripe PaymentIntent, create a Payment in our system, and
 * update the Orderable model
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
const createPaymentIntent = async (req, res, next) => {
    let paymentId;
    try {
        const payload = {
            body: req.body,
        };
        const output = await createPaymentIntentPipeline(payload);

        if (isEmpty(output)) {
            throw new Error('Output from createPaymentIntentPipeline is empty');
        }

        paymentId = output?.payment?.id || null;

        return res.json({
            success: true,
            paymentIntent: output?.paymentIntent,
            payment: output?.payment,
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

module.exports = exports = createPaymentIntent;

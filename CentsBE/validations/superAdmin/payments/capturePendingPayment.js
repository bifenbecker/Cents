const Payment = require('../../../models/payment');
const Order = require('../../../models/orders');

/**
 * Perform request validations over capturing stripe payments.
 *
 * Capturing stripe payments should not be allowed if:
 *
 * 1) The payment processor is not stripe
 * 2) The payment has already been paid or has been refunded
 * 3) The payment status is either requires_capture or requires_confirmation
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function validateRequest(req, res, next) {
    try {
        const { id } = req.params;
        const payment = await Payment.query().findById(id);
        const order = await Order.query().findById(payment.orderId);

        if (payment.status === 'succeeded' || payment.status === 'refunded') {
            res.status(422).json({
                error: 'This payment has already been completed (either paid or refunded).',
            });
            return;
        }

        if (payment.status === 'requires_payment_method') {
            res.status(422).json({
                error: 'This payment requires a new payment method in order to be completed. Please add a new payment method for this payment first.',
            });
            return;
        }

        if (payment.paymentProcessor !== 'stripe') {
            res.status(422).json({
                error: 'You can currently only capture a charge for a Stripe payment.',
            });
            return;
        }

        req.constants = req.constants || {};
        req.constants.payment = payment;
        req.constants.order = order;

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

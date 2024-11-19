const Payment = require('../../../models/payment');
const Order = require('../../../models/orders');

/**
 * Perform request validations over refunding cash payments.
 *
 * Cash refunds should not be allowed if:
 *
 * 1) The cash payment has already been refunded
 * 2) The payment processor is not cash
 *
 * DISCLAIMER: this validator will eventually be updated to support
 * refund processing for other payment processors (i.e., credit/debit, cash card)
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

        if (payment.status === 'refunded') {
            res.status(422).json({
                error: 'This payment has already been refunded.',
            });
            return;
        }

        if (payment.paymentProcessor !== 'cash' && payment.paymentProcessor !== 'stripe') {
            res.status(422).json({
                error: 'You can currently only refund a cash or Stripe payment.',
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

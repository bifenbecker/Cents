const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');
const stripe = require('../../../stripe/stripeWithSecret');
const validateReaderRequest = require('../../../validations/stripe/terminal/getIndividualReader');

/**
 * Fetch an individual terminal
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getIndividualTerminal(req, res, next) {
    try {
        const isValid = validateReaderRequest(req);

        if (!isValid) {
            return res.status(409).json({
                error: 'The reader ID provided is undefined',
            });
        }

        const { readerId } = req.params;
        const reader = await stripe.terminal.readers.retrieve(readerId);
        return res.json({
            success: true,
            reader,
        });
    } catch (error) {
        LoggerHandler('error', error, req);
        return next(error);
    }
}

/**
 * Process a payment intent via the Stripe Terminal server-driven integration
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function processTerminalPaymentIntent(req, res, next) {
    try {
        const { readerId, paymentIntentId } = req.body;

        await stripe.terminal.readers.processPaymentIntent(readerId, {
            payment_intent: paymentIntentId,
        });

        return res.json({
            success: true,
        });
    } catch (error) {
        LoggerHandler('error', error, req);
        return next(error);
    }
}

/**
 * Cancel a pending Terminal payment intent
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function cancelTerminalPayment(req, res, next) {
    try {
        const { readerId } = req.body;

        await stripe.terminal.readers.cancelAction(readerId);

        return res.json({
            success: true,
        });
    } catch (error) {
        LoggerHandler('error', error, req);
        return next(error);
    }
}

module.exports = exports = {
    getIndividualTerminal,
    processTerminalPaymentIntent,
    cancelTerminalPayment,
};

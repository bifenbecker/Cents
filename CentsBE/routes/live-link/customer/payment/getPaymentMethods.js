const stripe = require('../../../stripe/config');

const PaymentMethod = require('../../../../models/paymentMethod');

/**
 * Add and format last 4 card digits and brand details
 *
 * @param {Object} paymentMethod
 */
async function retrieveCardDetails(paymentMethod) {
    const details = {};

    if (paymentMethod.provider === 'stripe') {
        const stripeMethod = await stripe.paymentMethods.retrieve(paymentMethod.paymentMethodToken);

        details.last4 = stripeMethod.card.last4;
        details.brand = stripeMethod.card.brand;
    } else {
        details.last4 = null;
        details.brand = null;
    }

    details.centsCustomerId = paymentMethod.centsCustomerId;
    details.provider = paymentMethod.provider;
    details.type = paymentMethod.type;
    details.paymentMethodToken = paymentMethod.paymentMethodToken;
    details.id = paymentMethod.id;

    return details;
}

/**
 * Get and format payment methods for a given customer
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getCustomerPaymentMethods(req, res, next) {
    try {
        const { centsCustomerId } = req.params;

        const paymentMethods = await PaymentMethod.query().where({
            centsCustomerId,
        });

        let formattedPaymentMethods = paymentMethods.map((method) => retrieveCardDetails(method));

        formattedPaymentMethods = await Promise.all(formattedPaymentMethods);

        return res.status(200).json({
            success: true,
            paymentMethods: formattedPaymentMethods,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = getCustomerPaymentMethods;

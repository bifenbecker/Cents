const Joi = require('@hapi/joi');
const PaymentMethod = require('../../../models/paymentMethod');
const formatError = require('../../../utils/formatError');

/**
 * Determine if the PaymentMethod is already on file for the customer
 *
 * @param {Object} paymentData
 * @param {Number} centsCustomerId
 */
async function findPaymentMethod(paymentData, centsCustomerId) {
    const method = await PaymentMethod.query()
        .where({
            paymentMethodToken: paymentData.token,
            centsCustomerId,
        })
        .first();

    return method;
}

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        payment: Joi.object()
            .keys({
                provider: Joi.string().required(),
                type: Joi.string().required(),
                token: Joi.string().required(),
            })
            .required(),
        centsCustomerId: Joi.number().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: formatError(isValid.error),
            });
            return;
        }

        const { payment, centsCustomerId } = req.body;

        const paymentMethodExists = await findPaymentMethod(payment, centsCustomerId);

        if (paymentMethodExists) {
            res.status(409).json({
                error: 'The payment method you are trying to add already exists in our system for your profile.',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

const Joi = require('@hapi/joi');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        amount: Joi.number().required(),
        currency: Joi.string().required(),
        confirm: Joi.boolean().required(),
        payment_method_types: Joi.array().required(),
        capture_method: Joi.string().required(),
        metadata: Joi.object()
            .keys({
                orderId: Joi.number().required(),
                storeId: Joi.number().required(),
                customerEmail: Joi.string().optional().allow(null, ''),
                orderableType: Joi.string().required(),
                orderableId: Joi.number().required(),
                storeCustomerId: Joi.number().required(),
            })
            .required(),
        transfer_data: Joi.object()
            .keys({
                destination: Joi.string().required(),
            })
            .required(),
        on_behalf_of: Joi.string().required(),
        application_fee_amount: Joi.number().required(),
        payment_method: Joi.string().optional().allow(null, ''),
        customer: Joi.string().optional().allow(null, ''),
        payment_method_data: Joi.object()
            .keys({
                type: Joi.string().required(),
                card: Joi.object()
                    .keys({
                        token: Joi.string().required(),
                    })
                    .required(),
            })
            .optional(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

/**
 * Validate the incoming request to create a stripe payment intent from the employee app
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function validateRequest(req, res, next) {
    try {
        const validationObject = typeValidations(req.body);
        if (validationObject.error) {
            LoggerHandler(
                'error',
                'Validation error when creating payment intent',
                validationObject,
            );
            res.status(422).json({
                error: validationObject.error.message,
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

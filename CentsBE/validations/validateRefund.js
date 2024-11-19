const Joi = require('@hapi/joi');

// Models

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        cancellationReason: Joi.string().required(),
        orderId: Joi.number().required(),
        serviceOrderId: Joi.number().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        req.constants = req.constants || {};
        /**
         * Validate whether this order can be refunded -
         * Must be entire order
         * Must be paid via stripe terminal (card only)
         * Refunds will be entire order total no exceptions
         */
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

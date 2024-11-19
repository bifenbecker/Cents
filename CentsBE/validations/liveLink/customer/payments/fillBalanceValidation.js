const Joi = require('@hapi/joi');

function validateFillBalance(payload) {
    const schema = Joi.object().keys({
        credits: Joi.number()
            .min(5)
            .required()
            .error(new Error('Credits are required and should be equal or greater than 5')),
        paymentMethodToken: Joi.string()
            .required()
            .error(new Error('Payment method must be provided')),
        storeId: Joi.number()
            .integer()
            .min(1)
            .required()
            .error(new Error('Store Id must be provided')),
        autoRefillEnabled: Joi.boolean().optional(),
    });

    return Joi.validate(payload, schema);
}

function fillBalanceValidation(req, res, next) {
    try {
        const isTypeValid = validateFillBalance(req.body);
        if (isTypeValid.error) {
            res.status(422).json({
                error: isTypeValid.error.message,
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    fillBalanceValidation,
    validateFillBalance,
};

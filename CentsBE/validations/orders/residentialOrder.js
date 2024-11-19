const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        customerNotes: Joi.string().optional().allow('', null),
        orderNotes: Joi.string().optional().allow('', null),
        bags: Joi.array().items(
            Joi.object().keys({
                barcode: Joi.string().required(),
            }),
        ),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

function validateRequest(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

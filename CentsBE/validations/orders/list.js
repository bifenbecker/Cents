const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        page: Joi.number().integer().min(1).required(),
        keyword: Joi.string().optional().allow('', null),
        status: Joi.string().valid('active', 'completed').required(),
    });
    const validate = Joi.validate(inputObj, schema, { abortEarly: false });
    return validate;
}

function validateRequest(req, res, next) {
    try {
        const { page, status, keyword } = req.query;
        const isValid = typeValidations({ page, status, keyword });
        if (isValid.error) {
            const str = isValid.error.message.split('[');
            let errString = '';
            for (let i = 1; i < str.length; i++) {
                errString += ` ${str[i].split(']')[0]}.`;
            }
            res.status(422).json({
                error: errString,
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

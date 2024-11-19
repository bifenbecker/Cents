const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        query: Joi.string().required(),
        operationName: Joi.string(),
        variables: Joi.object(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

function graphQLValidation(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: /\[.*\]/.test(isValid.error.message)
                    ? isValid.error.message.split('[')[1].split(']')[0]
                    : isValid.error.message,
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = graphQLValidation;

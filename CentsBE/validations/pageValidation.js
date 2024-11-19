const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        page: Joi.number()
            .integer()
            .required()
            .error(new Error('page of type integer greater than 0 is required.')),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

function validatePage(req, res, next) {
    try {
        const { page } = req.query;
        const isValid = typeValidations({ page });
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

module.exports = exports = validatePage;

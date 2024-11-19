const Joi = require('@hapi/joi');
const formatError = require('../../utils/formatError');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        password: Joi.string().required(),
        confirmPassword: Joi.string().required(),
        storeId: Joi.number().integer().required(),
    });
    const inputObject = {
        password: inputObj.password,
        confirmPassword: inputObj.confirmPassword,
        storeId: inputObj.id,
    };
    const error = Joi.validate(inputObject, schema);
    return error;
}

async function validateUpdatePassword(req, res, next) {
    try {
        const { id } = req.params;
        const isValid = typeValidations({ ...req.body, id });
        if (isValid.error) {
            res.status(422).json({
                error: formatError(isValid.error),
            });
            return;
        }
        if (req.body.password !== req.body.confirmPassword) {
            res.status(400).json({
                error: 'passwords donot match',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateUpdatePassword;

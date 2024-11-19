const Joi = require('@hapi/joi');
const formatError = require('../../utils/formatError');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        teamMemberId: Joi.number().integer().min(1).required(),
    });
    const error = Joi.validate(inputObj, schema);
    return error;
}

async function validations(req, res, next) {
    try {
        const { id } = req.params;
        const isValid = typeValidations({ teamMemberId: id });
        if (isValid.error) {
            res.status(422).json({
                error: formatError(isValid.error),
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validations;

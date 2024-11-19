const Joi = require('@hapi/joi');
const formatError = require('../../utils/formatError');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        turnAroundInHours: Joi.number().integer().min(1).required(),
        storeId: Joi.number().integer().min(1).required(),
    });
    const inputObject = {
        turnAroundInHours: inputObj.turnAroundInHours,
        storeId: inputObj.storeId,
    };
    const error = Joi.validate(inputObject, schema);
    return error;
}

async function validateTurnAroundTime(req, res, next) {
    try {
        const { storeId } = req.params;
        const isValid = typeValidations({ ...req.body, storeId });
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

module.exports = exports = validateTurnAroundTime;

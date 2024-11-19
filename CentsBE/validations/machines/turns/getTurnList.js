const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        machineId: Joi.number().integer().required().min(1),
        page: Joi.number().integer().required().min(1),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}
async function getTurnList(req, res, next) {
    try {
        const { machineId } = req.params;
        const { page } = req.query;
        const isValid = typeValidations({ machineId, page });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.details[0].message,
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getTurnList;

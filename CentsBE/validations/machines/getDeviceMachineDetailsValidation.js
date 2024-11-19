const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        deviceId: Joi.number().integer().required().min(1),
    });

    return Joi.validate(inputObj, schema);
}

async function getDeviceMachineDetailsValidation(req, res, next) {
    try {
        const { deviceId } = req.params;
        const isValid = typeValidations({
            deviceId,
        });
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

module.exports = getDeviceMachineDetailsValidation;

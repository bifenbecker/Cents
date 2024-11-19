const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        deviceId: Joi.number().integer().min(1).required(),
        machineId: Joi.number().integer().min(1).required(),
        name: Joi.string().trim().max(8).min(1).required(),
    });

    return Joi.validate(inputObj, schema);
}

async function createNetworkedMachineByOfflineValidation(req, res, next) {
    try {
        const { name: machineName, deviceId } = req.body;
        const isValid = typeValidations({
            deviceId,
            machineId: req.params.machineId,
            name: machineName,
        });
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

module.exports = createNetworkedMachineByOfflineValidation;

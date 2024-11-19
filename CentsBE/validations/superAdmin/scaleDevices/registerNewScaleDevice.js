const Joi = require('@hapi/joi');

const ScaleDevice = require('../../../models/scaleDevice');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        deviceUuid: Joi.string().required(),
        pinNumber: Joi.string().required(),
        storeId: Joi.number().optional().allow(null, ''),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        const { deviceUuid, pinNumber } = req.body;

        const scaleDeviceExists = await ScaleDevice.query()
            .where({
                deviceUuid,
            })
            .orWhere({
                pinNumber,
            })
            .first();

        if (scaleDeviceExists) {
            res.status(422).json({
                error: 'The scale device matching the provided pin number or device UUID has already been registered',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

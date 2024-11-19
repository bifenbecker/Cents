const Joi = require('@hapi/joi');

const ScaleDevice = require('../../../models/scaleDevice');
const ScaleDeviceStoreMap = require('../../../models/scaleDeviceStoreMap');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        pinNumber: Joi.string().required(),
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

        const { pinNumber } = req.body;

        const scaleDevice = await ScaleDevice.query()
            .where({
                pinNumber,
            })
            .first();

        if (!scaleDevice) {
            res.status(409).json({
                error: 'We could not find the ScaleDevice you are trying to add to your store in our system. Please contact Cents Support for help!',
            });
            return;
        }

        const scaleDeviceStoreMap = await ScaleDeviceStoreMap.query()
            .where({
                scaleDeviceId: scaleDevice.id,
            })
            .first();

        if (scaleDeviceStoreMap) {
            res.status(409).json({
                error: 'The ScaleDevice you are trying to add to your store is already registered to another store! Try using a different pin number.',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

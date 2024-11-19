const Joi = require('@hapi/joi');

const ScaleDeviceStoreMap = require('../../../models/scaleDeviceStoreMap');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        storeId: Joi.number().required(),
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

        const { id } = req.params;
        req.constants = req.constants || {};

        const scaleDeviceStoreMap = await ScaleDeviceStoreMap.query()
            .where({
                scaleDeviceId: id,
            })
            .first();

        req.constants.scaleDeviceStoreMap = scaleDeviceStoreMap;

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

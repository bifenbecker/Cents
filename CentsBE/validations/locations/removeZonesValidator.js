const Joi = require('@hapi/joi');

const Zones = require('../../models/zone');

const getIdValidation = (idKey) =>
    Joi.number()
        .integer()
        .required()
        .error(new Error(`${idKey} is required/invalid.`));

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        zoneId: getIdValidation('zoneId'),
        storeId: getIdValidation('storeId'),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function removeZonesValidator(req, res, next) {
    try {
        const { zoneId, storeId } = req.params;
        const isValid = typeValidations({ zoneId, storeId });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        const zone = await Zones.query().findById(zoneId);

        if (!zone || !zone.id) {
            res.status(422).json({
                error: 'Zone does not exist',
            });
            return;
        }

        if (zone.deletedAt) {
            res.status(422).json({
                error: 'Zone is already removed',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = removeZonesValidator;

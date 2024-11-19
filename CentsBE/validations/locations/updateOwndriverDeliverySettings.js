const Joi = require('@hapi/joi');
const getBusiness = require('../../utils/getBusiness');
const validateZipcode = require('../../utils/validateZipcode');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        active: Joi.boolean().optional().allow('', null),
        deliveryFeeInCents: Joi.number().optional().allow('', null),
        returnDeliveryFeeInCents: Joi.number().optional().allow('', null),
        storeId: Joi.number().integer().required(),
        hasZones: Joi.boolean().optional().allow('', null),
        deliveryTierId: Joi.number().integer().min(1).optional(),
        deliveryWindowBufferInHours: Joi.number().min(0).optional(),
        zipCodes: Joi.when('hasZones', {
            is: false,
            then: Joi.array()
                .items(Joi.string())
                .min(1)
                .required()
                .error(new Error('Zip codes are required')),
            otherwise: Joi.array().optional(),
        }),
        zones: Joi.when('hasZones', {
            is: true,
            then: Joi.array().min(1).required().error(new Error('Zones are required')),
            otherwise: Joi.array().optional(),
        }),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const { storeId } = req.params;
        req.body.storeId = storeId;
        const isTypeValid = typeValidations(req.body);
        const business = await getBusiness(req);

        const { zipCodes } = req.body;
        if (zipCodes && zipCodes.length) await validateZipcode(zipCodes, business, storeId);

        if (isTypeValid.error) {
            res.status(422).json({
                error: isTypeValid.error.message,
            });
            return;
        }

        next();
    } catch (error) {
        if (error.message === 'invalid_zipcode') {
            res.status(404).json({
                error: 'please enter a valid zip code',
            });
        }
        if (error.message === 'zipcode_exists') {
            res.status(409).json({
                error: 'zip code exists for other store',
            });
        } else {
            next(error);
        }
    }
}

module.exports = exports = validateRequest;

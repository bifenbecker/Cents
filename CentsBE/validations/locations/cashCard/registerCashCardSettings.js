const Joi = require('@hapi/joi');

const getBusiness = require('../../../utils/getBusiness');

const Store = require('../../../models/store');
const EsdReader = require('../../../models/esdReader');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        hasEsdEnabled: Joi.boolean().required(),
        hasCciEnabled: Joi.boolean().required(),
        hasLaundroworksEnabled: Joi.boolean().required(),
        hasSpyderWashEnabled: Joi.boolean().required(),
        deviceSerialNumber: Joi.when('hasEsdEnabled', {
            is: true,
            then: Joi.string().required(),
            otherwise: Joi.string().allow(null, '').optional(),
        }),
        esdLocationId: Joi.when('hasEsdEnabled', {
            is: true,
            then: Joi.string().required(),
            otherwise: Joi.string().allow(null, '').optional(),
        }),
        username: Joi.when('hasCciEnabled', {
            is: true,
            then: Joi.string().required(),
            otherwise: Joi.string().allow(null, '').optional(),
        }),
        password: Joi.when('hasCciEnabled', {
            is: true,
            then: Joi.string().required(),
            otherwise: Joi.string().allow(null, '').optional(),
        }),
        cciStoreId: Joi.when('hasCciEnabled', {
            is: true,
            then: Joi.number().integer().required(),
            otherwise: Joi.string().allow(null, '').optional(),
        }),
        laundroworksUsername: Joi.when('hasLaundroworksEnabled', {
            is: true,
            then: Joi.string().required(),
            otherwise: Joi.string().allow(null, '').optional(),
        }),
        laundroworksPassword: Joi.when('hasLaundroworksEnabled', {
            is: true,
            then: Joi.string().required(),
            otherwise: Joi.string().allow(null, '').optional(),
        }),
        customerKey: Joi.when('hasLaundroworksEnabled', {
            is: true,
            then: Joi.string().required(),
            otherwise: Joi.string().allow(null, '').optional(),
        }),
        laundroworksLocationId: Joi.when('hasLaundroworksEnabled', {
            is: true,
            then: Joi.string().required(),
            otherwise: Joi.string().allow(null, '').optional(),
        }),
        laundroworksPosNumber: Joi.when('hasLaundroworksEnabled', {
            is: true,
            then: Joi.string().required(),
            otherwise: Joi.string().allow(null, '').optional(),
        }),
        spyderWashOperatorCode: Joi.when('hasSpyderWashEnabled', {
            is: true,
            then: Joi.string().required(),
            otherwise: Joi.string().allow(null, '').optional(),
        }),
        spyderWashLocationCode: Joi.when('hasSpyderWashEnabled', {
            is: true,
            then: Joi.string().required(),
            otherwise: Joi.string().allow(null, '').optional(),
        }),
        hasCashEnabled: Joi.boolean().required(),
        hasCashDrawer: Joi.boolean().required(),
        hasOtherPaymentMethods: Joi.boolean().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const { id } = req.params;
        req.constants = {};

        const isValid = typeValidations(req.body);

        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        const business = await getBusiness(req);
        const store = await Store.query().findOne({
            id,
            businessId: business.id,
        });
        if (!store) {
            res.status(404).json({
                error: 'Store not found.',
            });
            return;
        }

        const readers = await EsdReader.query().where({ storeId: id });

        if (readers.length > 0) {
            const esdReader = readers[0];
            req.constants.currentEsdReader = esdReader;
        } else {
            req.constants.currentEsdReader = null;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

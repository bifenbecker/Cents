const Joi = require('@hapi/joi');
const find = require('lodash/find');
const { pricingTiersTypes } = require('../../constants/constants');

function typeValidations(req) {
    const validationSchema = Joi.object().keys({
        name: Joi.string().required(),
        type: Joi.string().required(),
        servicePrices: Joi.array().optional(),
        inventoryPrices: Joi.array().optional(),
        commercialDeliveryFeeInCents: Joi.number().min(0).allow(null),
        offerDryCleaningForDeliveryTier: Joi.boolean().optional(),
        locationId: Joi.number().optional().allow(null),
    });
    const validate = Joi.validate(req, validationSchema);
    return validate;
}

async function validate(req, res, next) {
    try {
        const isTypeValid = typeValidations(req.body);
        if (isTypeValid.error) {
            res.status(422).json({
                error: isTypeValid.error.details[0].message,
            });
            return;
        }
        if (
            !find(req.body.servicePrices, {
                isFeatured: true,
                isDeliverable: true,
            })
        ) {
            res.status(422).json({
                error: 'At least one service must be selected to create a pricing tier',
            });
            return;
        }

        if (
            req.body.commercialDeliveryFeeInCents &&
            req.body.type !== pricingTiersTypes.COMMERCIAL
        ) {
            res.status(422).json({
                error: 'Commercial delivery fee can only be set for commercial tiers',
            });
            return;
        }
        next();
    } catch (e) {
        next(e);
    }
}

module.exports = validate;

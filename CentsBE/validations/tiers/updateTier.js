const Joi = require('@hapi/joi');
const getBusiness = require('../../utils/getBusiness');
const PricingTier = require('../../models/pricingTier');

function typeValidations(req) {
    const validationSchema = Joi.object().keys({
        id: Joi.number().integer().min(1).required(),
        name: Joi.string().trim(),
        type: Joi.string(),
        commercialDeliveryFeeInCents: Joi.number().integer().min(0).allow(null),
    });
    const validate = Joi.validate(req, validationSchema);
    return validate;
}

async function validateTierName({ tierName, tierId, tierType, res }) {
    const existingTier = await PricingTier.query()
        .whereRaw('lower(name) = ?', [tierName.toLowerCase()])
        .andWhere('type', tierType)
        .first();

    if (existingTier && existingTier.id !== Number(tierId)) {
        res.status(422).json({
            error: `A ${tierType.toLowerCase()} tier with the same name already exists`,
        });
    }
}

async function validate(req, res, next) {
    try {
        const { id } = req.params;
        const isValid = typeValidations({
            ...req.body,
            id,
        });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.details[0].message,
            });
            return;
        }
        const business = await getBusiness(req);
        const tier = await PricingTier.query().where('businessId', business.id).findById(id);
        if (!tier) {
            res.status(422).json({
                error: 'Invalid tier id',
            });
            return;
        }

        const { name, type, commercialDeliveryFeeInCents } = req.body;

        if (name) {
            await validateTierName({
                tierName: name,
                tierId: req.params.id,
                tierType: type,
                res,
            });
        }

        if (commercialDeliveryFeeInCents && tier.type !== 'COMMERCIAL') {
            res.status(422).json({
                error: 'Commercial delivery fee can only be set for commercial tiers',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validate;

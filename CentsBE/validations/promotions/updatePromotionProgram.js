const Joi = require('@hapi/joi');
const BusinessPromotionProgram = require('../../models/businessPromotionProgram');
const getBusiness = require('../../utils/getBusiness');

function typeValidations(input) {
    const schema = Joi.object().keys({
        name: Joi.string().optional(),
        active: Joi.boolean().optional(),
        promotionType: Joi.string().optional(),
        discountValue: Joi.number().optional(),
        appliesToType: Joi.string().optional(),
        customerRedemptionLimit: Joi.number().optional(),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional().allow(null, ''),
        locationEligibilityType: Joi.string().optional(),
        storePromotions: Joi.array().optional().allow(null, ''),
        promotionItems: Joi.array()
            .items(
                Joi.object().keys({
                    promotionItemId: Joi.number().required(),
                    promotionItemType: Joi.string().required(),
                }),
            )
            .optional()
            .allow(null, ''),
        requirementType: Joi.string().optional(),
        requirementValue: Joi.number().optional().allow(null, ''),
        activeDays: Joi.array()
            .items(
                Joi.object().keys({
                    day: Joi.string().required(),
                }),
            )
            .optional(),
    });

    const error = Joi.validate(input, schema);
    return error;
}

async function validateNameForPromotionProgram(name, businessId) {
    const promotionProgram = await BusinessPromotionProgram.query().where({
        name,
        businessId,
    });

    return promotionProgram;
}

async function validate(req, res, next) {
    try {
        const business = await getBusiness(req);
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        const { name } = req.body;
        const { id } = req.params;

        if (name) {
            const doesProgramExist = await validateNameForPromotionProgram(name, business.id);

            if (doesProgramExist.length && doesProgramExist[0].id !== Number(id)) {
                res.status(409).json({
                    error: 'The name you are using for the promotion program you are trying to update has already been taken.',
                });
                return;
            }
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = validate;

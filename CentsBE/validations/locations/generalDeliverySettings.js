const Joi = require('@hapi/joi');
const { deliveryPriceTypes } = require('../../constants/constants');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        deliveryEnabled: Joi.boolean().optional().allow('', null),
        turnAroundInHours: Joi.number().integer().optional().allow('', null),
        storeId: Joi.number().integer().required(),
        deliveryPriceType: Joi.string()
            .valid(deliveryPriceTypes.RETAIL, deliveryPriceTypes.DELIVERY_TIER)
            .error(
                () =>
                    `deliveryPriceType is required and must be ${deliveryPriceTypes.RETAIL} or ${deliveryPriceTypes.DELIVERY_TIER}`,
            ),
        zones: Joi.array()
            .items(
                Joi.object().keys({
                    id: Joi.number().integer().required(),
                    deliveryTierId: Joi.number().integer().required(),
                }),
            )
            .optional(),
        deliveryTierId: Joi.when('deliveryPriceType', {
            is: deliveryPriceTypes.DELIVERY_TIER,
            then: Joi.when('zones', {
                is: Joi.array().min(1).exist(),
                then: Joi.number().integer().optional().allow('', null),
                otherwise: Joi.number().integer().required(),
            }),
            otherwise: Joi.number().integer().optional().allow('', null),
        }),
        deliveryServiceIds: Joi.when('deliveryPriceType', {
            is: deliveryPriceTypes.RETAIL,
            then: Joi.array().items(Joi.number().integer()).min(1).required(),
            otherwise: Joi.array().items(Joi.number().integer()).min(1).optional(),
        }),
        recurringDiscountInPercent: Joi.number().optional().allow('', null),
        offerDryCleaningForDelivery: Joi.boolean().optional(),
        dryCleaningDeliveryPriceType: Joi.string().optional().allow('', null),
        customLiveLinkHeader: Joi.string().optional().allow('', null).max(30),
        customLiveLinkMessage: Joi.string().optional().allow('', null).max(300),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const { storeId } = req.params;
        req.body.storeId = storeId;
        const isTypeValid = typeValidations(req.body);
        if (isTypeValid.error) {
            res.status(422).json({
                error: isTypeValid.error.message,
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

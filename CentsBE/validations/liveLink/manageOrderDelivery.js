const Joi = require('@hapi/joi');

function typeValidation(input) {
    const pickupOrReturn = Joi.object()
        .keys({
            id: Joi.number().optional(),
            centsCustomerAddressId: Joi.number()
                .required()
                .error(new Error('centsCustomerAddressId is required.')),
            type: Joi.string()
                .valid('PICKUP', 'RETURN')
                .required()
                .error(new Error('type is required.')),
            timingsId: Joi.number().required().error(new Error('timingsId is required.')),
            deliveryProvider: Joi.string()
                .required()
                .error(new Error('deliveryProvider is required.')),
            deliveryWindow: Joi.array()
                .items(Joi.number().required(), Joi.number().required())
                .error(new Error('deliveryWindow is required.')),
            totalDeliveryCost: Joi.number()
                .required()
                .error(new Error('totalDeliveryCost is required.')),
            thirdPartyDeliveryId: Joi.number()
                .allow(null)
                .error(new Error('thirdPartyDeliveryId is required.')),
            thirdPartyDeliveryCostInCents: Joi.number().allow(null),
            courierTip: Joi.number().required().error(new Error('courierTip is required.')),
            subsidyInCents: Joi.number().required().error(new Error('subsidyInCents is required.')),
        })
        .optional();

    const subscription = Joi.object()
        .keys({
            id: Joi.number().required(),
            pickupWindow: Joi.array()
                .items(Joi.number().min(0).integer().required())
                .length(2)
                .required()
                .error(new Error('Pickup windows are required.')),
            returnWindow: Joi.array().optional().allow(null, ''),
            pickupTimingsId: Joi.number().required(),
            deliveryTimingsId: Joi.number().optional().allow(null, ''),
            paymentToken: Joi.string().required(),
            servicePriceId: Joi.number().required().allow('', null),
            modifierIds: Joi.array().required().allow(null, []),
            interval: Joi.number().required(),
            weekday: Joi.number().required(),
        })
        .optional();

    const Schema = Joi.object().keys({
        id: Joi.number().required().error(new Error('id is required.')),
        customerNotes: Joi.string()
            .required()
            .allow('')
            .error(new Error('customerNotes is required.')),
        orderNotes: Joi.string().required().allow('').error(new Error('orderNotes is required.')),
        returnMethod: Joi.string()
            .required()
            .allow('')
            .error(new Error('returnMethod is required.')),
        isPickupCancelled: Joi.boolean().optional(),
        paymentToken: Joi.string().optional().allow(''),
        servicePriceId: Joi.number().optional().allow('', null),
        modifierIds: Joi.array().optional().allow(null, []),
        orderDelivery: Joi.object({
            pickup: pickupOrReturn,
            return: pickupOrReturn,
        }).optional(),
        subscription,
    });

    const validate = Schema.validate(input);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const isValid = typeValidation(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        req.constants = req.constants || {};
        req.constants.from = 'MANAGE_ORDER';
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

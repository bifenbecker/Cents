const Joi = require('@hapi/joi');
const { deliveryProviders, returnMethods } = require('../../constants/constants');

const Store = require('../../models/store');
const Promotion = require('../../models/businessPromotionProgram');

const { findStoreById } = require('../../elasticsearch/store/queries');
const { getCustomerAddress } = require('../../services/liveLink/queries/customer');

const { validateCustomerRedemption } = require('../../routes/employeeTab/promotions/promotions');

function orderDeliveryTypeObj() {
    return {
        deliveryProvider: Joi.string().valid(['OWN_DRIVER', 'DOORDASH']).required(),
        deliveryWindow: Joi.array()
            .items(Joi.number().min(0).integer().required())
            .length(2)
            .required()
            .error(
                new Error(
                    'Delivery windows are required. Each window should be greater than or equal to 0.',
                ),
            ),
        thirdPartyDeliveryId: Joi.number().allow(null),
        timingsId: Joi.number().required(),
        totalDeliveryCost: Joi.number().required(),
        thirdPartyDeliveryCostInCents: Joi.number().optional(),
        courierTip: Joi.number().required(),
        subsidyInCents: Joi.number().optional(),
    };
}

function typeValidations(inputObj) {
    let schema = Joi.object().keys({
        storeId: Joi.number()
            .integer()
            .min(1)
            .required()
            .error(new Error('StoreId is required and should be greater than 0.')),
        turnAroundInHours: Joi.when('hasDryCleaning', {
            is: true,
            then: Joi.number()
                .integer()
                .min(0)
                .required()
                .error(new Error('turnAroundInHours is required and should be at least 0')),
            otherwise: Joi.number().allow('', null).optional(),
        }),
        servicePriceId: Joi.when('hasDryCleaning', {
            is: true,
            then: Joi.number().integer().optional(),
            otherwise: Joi.number()
                .integer()
                .min(1)
                .required()
                .error(new Error('service price id is required and should be greater than 0.')),
        }),
        serviceModifierIds: Joi.array()
            .items(Joi.number().integer().min(1))
            .optional()
            .error(new Error('ServiceModifierIds must have integer values greater than 0.')),
        customerNotes: Joi.string().allow('', null).optional(),
        hangDryInstructions: Joi.string().allow('', null).optional(),
        isHangDrySelected: Joi.boolean().optional(),
        orderNotes: Joi.string().allow('', null).optional(),
        customerAddressId: Joi.number()
            .integer()
            .min(1)
            .required()
            .error(new Error('CustomerAddressId is required and should be greater than 0.')),
        returnMethod: Joi.string().valid(Object.keys(returnMethods)),
        paymentToken: Joi.string().required(),
        promoCode: Joi.string().allow('', null).optional(),
        bagCount: Joi.number().allow('', null).optional(),
        subscription: Joi.object()
            .keys({
                interval: Joi.number().integer().required(),
                pickupWindow: Joi.array()
                    .items(Joi.number().min(0).integer().required())
                    .length(2)
                    .required()
                    .error(
                        new Error(
                            'Pickup windows are required. Each window should be greater than or equal to 0.',
                        ),
                    ),
                returnWindow: Joi.array().optional().allow(null, ''),
                servicePriceId: Joi.number().integer().required(),
                modifierIds: Joi.array().optional().allow(null, ''),
                pickupTimingsId: Joi.number().required(),
                deliveryTimingsId: Joi.number().optional().allow(null, ''),
            })
            .optional()
            .allow(null, ''),
        zipCode: Joi.string().required(),
        hasDryCleaning: Joi.boolean().optional(),
    });
    let orderDeliverySchema = Joi.object().keys({
        pickup: Joi.object().keys({
            type: Joi.string()
                .valid('PICKUP')
                .required()
                .error(new Error('Pickup type must be PICKUP.')),
            ...orderDeliveryTypeObj(),
        }),
        delivery: Joi.object(),
    });
    if (inputObj.returnMethod === returnMethods.DELIVERY) {
        orderDeliverySchema = orderDeliverySchema.append({
            delivery: Joi.object().keys({
                type: Joi.string()
                    .valid('RETURN')
                    .required()
                    .error(new Error('Delivery Type must be RETURN.')),
                ...orderDeliveryTypeObj(),
            }),
        });
    }
    schema = schema.append({
        orderDelivery: orderDeliverySchema,
    });

    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const { storeId } = req.params;
        const { body, currentCustomer } = req;
        const isTypeValid = typeValidations({
            ...body,
            storeId,
        });
        if (isTypeValid.error) {
            res.status(422).json({
                error: isTypeValid.error.message,
            });
            return;
        }
        const store = await findStoreById(storeId);
        if (!store) {
            res.status(404).json({
                error: 'Store not found.',
            });
            return;
        }
        req.constants = req.constants || {};
        const { orderDelivery, promoCode } = body;

        if (orderDelivery.deliveryProvider === deliveryProviders.UBER && !store.uberStoreUuid) {
            res.status(409).json({
                error: 'Selected store does not offer on demand delivery.',
            });
            return;
        }
        if (
            orderDelivery.deliveryProvider === deliveryProviders.OWN_DRIVER &&
            !store.offersOwnDelivery
        ) {
            res.status(409).json({
                error: 'Selected store does not offer own driver delivery.',
            });
            return;
        }

        const { customerAddressId } = body;
        const customerAddress = await getCustomerAddress(currentCustomer.id, customerAddressId);
        if (!customerAddress) {
            res.status(404).json({
                error: 'Customer address not found.',
            });
            return;
        }
        const storeDetails = await Store.query().findById(storeId).withGraphJoined('settings');

        if (promoCode) {
            const promotion = await Promotion.query()
                .withGraphFetched('promotionItems')
                .where({
                    businessId: storeDetails.businessId,
                    name: promoCode,
                })
                .first();

            if (!promotion) {
                res.status(404).json({
                    error: 'The promotion code is invalid or does not exist.',
                });
                return;
            }
            if (!promotion.active) {
                res.status(404).json({
                    error: 'This promotion is no longer active.',
                });
                return;
            }
            const redemptionLimitValidation = await validateCustomerRedemption(
                promotion,
                currentCustomer.id,
            );
            if (!redemptionLimitValidation) {
                res.status(404).json({
                    error: 'This promotion is no longer applicable.',
                });
                return;
            }

            req.constants.promotion = promotion;
        }

        req.constants.orderItems = [];
        req.constants.customerAddress = customerAddress;
        req.constants.store = store;
        req.constants.store.settings = storeDetails.settings;
        req.constants.storeDetails = storeDetails;
        req.constants.from = 'CREATE_ONLINE_ORDER';

        next();
    } catch (error) {
        if (error.message === 'Response Error') {
            res.status(404).json({
                error: 'Store not found.',
            });
            return;
        }
        next(error);
    }
}

module.exports = exports = validateRequest;

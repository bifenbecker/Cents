const Joi = require('@hapi/joi');
const Order = require('../../../models/orders');
const ServiceOrder = require('../../../models/serviceOrders');
const CentsCustomer = require('../../../models/centsCustomer');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

// TODO: Add modifier details validations.
function typeValidations(input, requiresEmployeeCode) {
    const schema = Joi.object().keys({
        orderId: Joi.number().optional().allow(null),
        promotionId: Joi.number().optional().allow(null),
        totalWeight: Joi.number().optional(),
        tipAmount: Joi.number().optional().allow(null),
        convenienceFeeId: Joi.number().optional().allow(null),
        creditAmount: Joi.number().optional().allow(null),
        chargeableWeight: Joi.number().optional(),
        orderItems: Joi.array().items(
            Joi.object().keys({
                id: Joi.any().optional().allow(null),
                isDeleted: Joi.boolean().optional(),
                priceId: Joi.when('isDeleted', {
                    is: true,
                    then: Joi.number().optional(),
                    otherwise: Joi.number().required(),
                }),
                chargeableWeight: Joi.number().optional(),
                count: Joi.when('category', {
                    is: Joi.string().valid('PER_POUND'),
                    then: Joi.number().required(),
                    otherwise: Joi.number().min(1).integer().required(),
                }),
                category: Joi.when('lineItemType', {
                    is: Joi.string().valid('SERVICE'),
                    then: Joi.string().required(),
                    otherwise: Joi.string().valid('INVENTORY').required(),
                }),
                weight: Joi.number().allow(null).optional(),
                lineItemType: Joi.string().valid('SERVICE', 'INVENTORY').required(),
                serviceModifierIds: Joi.array().items(Joi.number().integer().optional()),
                orderItemId: Joi.number().optional().allow(null),
            }),
        ),
        storeId: Joi.number().required(),
        orderType: Joi.string().valid('ServiceOrder', 'InventoryOrder'),
        centsCustomerId: Joi.number().required(),
        removeConvenienceFee: Joi.boolean().optional(),
    });

    const error = Joi.validate(input, schema);
    return error;
}

async function orderCalculationsValidation(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            LoggerHandler(
                'error',
                `422 error in /orders/calculate-total API validation: ${JSON.stringify(isValid)}`,
                req.body,
            );
            const errorMessage = isValid?.error?.details[0]?.message || isValid?.error?.message;
            res.status(422).json({
                error: errorMessage,
            });
            return;
        }

        const centsCustomer = await CentsCustomer.query().findById(req.body.centsCustomerId);

        if (!centsCustomer) {
            res.status(422).json({
                error: 'Invalid customer id',
            });
            return;
        }

        req.constants = {};

        if (req.body.orderId) {
            const { orderableId } = await Order.query().findById(req.body.orderId);
            const serviceOrder = await ServiceOrder.query().findById(orderableId);
            req.constants.serviceOrderId = orderableId;
            req.constants.serviceOrder = serviceOrder;
        }

        next();
    } catch (error) {
        LoggerHandler(
            'error',
            `Thrown error in order calculation API validation: ${JSON.stringify(error)}`,
            req.body,
        );
        next(error);
    }
}

module.exports = exports = orderCalculationsValidation;

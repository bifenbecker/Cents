const Joi = require('@hapi/joi');

const OrderDelivery = require('../../models/orderDelivery');

const { orderDeliveryStatuses } = require('../../constants/constants');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        status: Joi.string().required(),
        orderDeliveryId: Joi.number().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        const { status, orderDeliveryId } = req.body;

        if (!Object.values(orderDeliveryStatuses).includes(status)) {
            res.status(422).json({
                error: 'The status you have selected is not a valid status.',
            });
            return;
        }

        const orderDelivery = await OrderDelivery.query().findById(orderDeliveryId);

        req.constants = req.constants || {};
        req.constants.orderDelivery = orderDelivery;

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

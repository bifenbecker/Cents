const Joi = require('@hapi/joi');

const OrderDelivery = require('../../../models/orderDelivery');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.number().required(),
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

        req.constants = req.constants || {};

        const { id } = req.body;
        const orderDelivery = await OrderDelivery.query().withGraphFetched('order').findById(id);
        const serviceOrder = await orderDelivery.order.getOrderable();

        if (orderDelivery.type !== 'PICKUP') {
            res.status(422).json({
                error: 'You can only mark pickups as complete.',
            });
            return;
        }

        req.constants.serviceOrder = serviceOrder;

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

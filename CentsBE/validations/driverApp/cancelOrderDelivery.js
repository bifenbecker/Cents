const Joi = require('@hapi/joi');

// Models
const OrderDelivery = require('../../models/orderDelivery');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        cancellationReason: Joi.string().required(),
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
        const { id } = req.params;
        const orderDelivery = await OrderDelivery.query().findById(id);

        if (orderDelivery.status === 'CANCELLLED') {
            res.status(422).json({
                error: 'Order Delivery Already Cancelled',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

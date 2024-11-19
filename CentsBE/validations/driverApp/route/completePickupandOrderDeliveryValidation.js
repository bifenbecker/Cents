const Joi = require('@hapi/joi');

// Models
const RouterDelivery = require('../../../models/routeDeliveries');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        notes: Joi.string().optional().allow(null, ''),
        imageUrl: Joi.string().optional().allow(null, ''),
        bagsCount: Joi.number().allow('', null).optional(),
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
        const { routeDeliveryId } = req.params;
        const routeDelivery = await RouterDelivery.query()
            .withGraphJoined('orderDelivery')
            .findById(routeDeliveryId)
            .where('routeDeliveries.routableType', 'OrderDelivery');
        if (routeDelivery.status === 'CANCELED') {
            res.status(409).json({
                error: 'You Cannot Complete or PickedUp The Canceled Order',
            });
            return;
        }

        if (routeDelivery.status === 'COMPLETED') {
            res.status(409).json({
                error: 'Route Delivery already Completed',
            });
            return;
        }

        if (routeDelivery.status === 'PICKED_UP') {
            res.status(409).json({
                error: 'Route Delivery already Picked',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

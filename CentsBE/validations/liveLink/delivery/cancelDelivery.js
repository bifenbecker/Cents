const Joi = require('@hapi/joi');

// Models
const ServiceOrder = require('../../../models/serviceOrders');
const OrderDelivery = require('../../../models/orderDelivery');
const { orderDeliveryStatuses: statuses } = require('../../../constants/constants');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        cancellationReason: Joi.string().required(),
        orderDeliveryId: Joi.number().required(),
        serviceOrderId: Joi.number().required(),
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

        const { serviceOrderId, orderDeliveryId } = req.body;
        const serviceOrder = await ServiceOrder.query()
            .withGraphFetched('[orderItems.[referenceItems.[lineItemDetail]]]')
            .findById(serviceOrderId);
        const orderDelivery = await OrderDelivery.query().findById(orderDeliveryId);

        if ([statuses.COMPLETED, statuses.CANCELED].includes(orderDelivery.status)) {
            res.status(422).json({
                error: 'You can only cancel a delivery with status not as completed or canceled',
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

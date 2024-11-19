const Joi = require('@hapi/joi');
const ServiceOrder = require('../../../models/serviceOrders');
const StoreSettings = require('../../../models/storeSettings');
const eventEmitter = require('../../../config/eventEmitter');
const { orderSmsEvents } = require('../../../constants/constants');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        storeCustomerId: Joi.number().required(),
        serviceOrderId: Joi.number().required(),
    });

    const isValid = Joi.validate(inputObj, schema);
    return isValid;
}

async function sendLiveLink(req, res, next) {
    try {
        const { serviceOrderId } = req.body;

        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        const order = await ServiceOrder.query().findById(serviceOrderId);
        const storeSettings = await StoreSettings.query().findOne({
            storeId: order.storeId,
        });

        if (!storeSettings.hasSmsEnabled) {
            res.status(422).json({
                error: 'This store currently has SMS messages disabled. Please contact a Cents support specialist for assistance.',
            });
            return;
        }

        if (['COMPLETED', 'CANCELLED', 'DESIGNATED_FOR_PROCESSING_AT_HUB'].includes(order.status)) {
            res.status(403).json({
                error: 'Livelink can not be send.',
            });
            return;
        }
        eventEmitter.emit('orderSmsNotification', orderSmsEvents.SEND_LIVE_LINK, serviceOrderId);

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = sendLiveLink;

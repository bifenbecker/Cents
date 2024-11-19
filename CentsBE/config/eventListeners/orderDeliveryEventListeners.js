const eventEmitter = require('../eventEmitter');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const { cancelDoordashDeliveryQueue } = require('../../appQueues');
const OrderDelivery = require('../../models/orderDelivery');
const { deliveryProviders } = require('../../constants/constants');

eventEmitter.on('orderDeliveryUpdated', async (payload) => {
    try {
        LoggerHandler('info', 'orderDeliveryUpdated event triggered', payload);

        const { orderDeliveryId } = payload;
        const orderDelivery = await OrderDelivery.query().findById(orderDeliveryId);
        if (orderDelivery && orderDelivery.deliveryProvider === deliveryProviders.DOORDASH) {
            cancelDoordashDeliveryQueue.add('cancelDoordashDeliveryQueue', payload);
        }
    } catch (error) {
        LoggerHandler('error', error, {
            error,
            manualMessage: 'error in order delivery canceled event listener',
            payload,
        });
    }
});

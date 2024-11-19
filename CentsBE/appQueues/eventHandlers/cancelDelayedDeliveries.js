const Store = require('../../models/store');
const ServiceOrderQuery = require('../../services/queries/serviceOrder');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

const {
    orderDeliveryStatuses,
    returnMethods,
    orderSmsEvents,
} = require('../../constants/constants');
const cancelProcessingDelayedDeliveries = require('../../pipeline/employeeApp/serviceOrder/cancelProcessingDelayedDeliveries');
const eventEmitter = require('../../config/eventEmitter');

async function cancelDelayedDeliveries(job, done) {
    LoggerHandler('info', 'Event received in cancelDelayedDeliveries app queue', job.data);

    try {
        const { serviceOrderId } = job.data;
        const serviceOrderQuery = new ServiceOrderQuery(serviceOrderId);
        const serviceOrderDetails = await serviceOrderQuery.serviceOrderDetails();
        if (serviceOrderDetails.isCancelled) {
            done();
        }
        const activeDeliveries = await serviceOrderQuery.activeDeliveries();
        const returnDelivery = activeDeliveries.find((delivery) => delivery.type === 'RETURN');
        if (returnDelivery && returnDelivery.status === orderDeliveryStatuses.INTENT_CREATED) {
            const store = await Store.query().findById(serviceOrderDetails.storeId);
            const payload = {
                serviceOrderId,
                returnMethod: returnMethods.IN_STORE_PICKUP,
                intentCreatedOrderDelivery: returnDelivery,
                orderDeliveryId: returnDelivery.id,
                serviceOrder: serviceOrderDetails,
                store,
                orderDelivery: returnDelivery,
                masterOrderId: returnDelivery.orderId,
            };
            eventEmitter.emit(
                'orderSmsNotification',
                orderSmsEvents.ORDER_PROCESSING_DELAYED,
                serviceOrderId,
            );

            await cancelProcessingDelayedDeliveries(payload);
        }
        done();
    } catch (error) {
        LoggerHandler('error', error, {
            manualMessage: 'Error in canceling processing delayed order deliveries.',
            job,
        });
        done(error);
    }
}

module.exports = exports = cancelDelayedDeliveries;

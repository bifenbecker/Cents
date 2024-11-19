const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const { orderSmsEvents } = require('../../constants/constants');
const OrderSmsNotificationFactory = require('../../smsNotification/orderSmsNotificationFactory');
const RouteDeliverySMSNotification = require('../../smsNotification/routeDeliverySMSNotification');
const ServiceOrder = require('../../models/serviceOrders');
const ScheduleJobManager = require('../../services/scheduleJobs/scheduleJobManager');

function orderSmsNotificationInstance(serviceOrderDetails, eventName) {
    const { storeCustomer } = serviceOrderDetails;
    return new OrderSmsNotificationFactory(
        serviceOrderDetails,
        storeCustomer,
        eventName,
    ).findSmsNotificationInstance();
}

function routeDeliverySmsNotificationInstance(serviceOrderDetails, eventName) {
    const { storeCustomer } = serviceOrderDetails;
    return new RouteDeliverySMSNotification(serviceOrderDetails, storeCustomer, eventName);
}

function getServiceOrder(serviceOrderId) {
    return ServiceOrder.query().findById(serviceOrderId).withGraphFetched('[storeCustomer]');
}

const orderSmsEventsMapping = {
    [orderSmsEvents.ONLINE_ORDER_CREATED]: 'onlineOrderCreated',
    [orderSmsEvents.ORDER_CREATED]: 'orderCreated',
    [orderSmsEvents.INTAKE_COMPLETED]: 'intakeCompleted',
    [orderSmsEvents.IN_TRANSIT_TO_STORE]: 'inTransitToStore',
    [orderSmsEvents.DROPPED_OFF_AT_STORE]: 'droppedOffAtStore',
    [orderSmsEvents.EN_ROUTE_TO_PICKUP]: 'enRouteToPickup',
    [orderSmsEvents.EN_ROUTE_TO_DROP_OFF]: 'enRouteToDropOff',
    [orderSmsEvents.EN_ROUTE_ETA_UPDATED]: 'enRouteEtaUpdated',
    [orderSmsEvents.ROUTE_DELIVERY_CANCELED]: 'sendRouteDeliveryCanceledNotification',
    [orderSmsEvents.ROUTE_DELIVERY_COMPLETED]: 'sendRouteDeliveryCompleteNotification',
    [orderSmsEvents.PICK_UP_ORDER_CANCELED]: 'pickupOrderCanceled',
    [orderSmsEvents.DELIVERY_ORDER_CANCELED]: 'deliveryOrderCanceled',
    [orderSmsEvents.READY_FOR_PICKUP]: 'readyForPickup',
    [orderSmsEvents.SEND_LIVE_LINK]: 'sendLiveLink',
    [orderSmsEvents.ORDER_COMPLETED]: 'orderCompleted',
    [orderSmsEvents.INTENT_ORDER_DELIVERY_NOTIFICATION]: 'intentOrderDeliveryNotification',
    [orderSmsEvents.INTENT_ORDER_PICKUP_NOTIFICATION]: 'intentOrderPickupNotification',
    [orderSmsEvents.ORDER_PAYMENT_FAILED]: 'orderPaymentFailed',
    [orderSmsEvents.ORDER_PROCESSING_DELAYED]: 'orderProcessingDelayed',
    [orderSmsEvents.RECURRING_ONLINE_ORDER]: 'recurringOnlineOrder',
    [orderSmsEvents.READY_FOR_PICKUP_SCHEDULED]: 'readyForPickupScheduled',
};

async function getOrderSmsInstance(data) {
    const { serviceOrderId, eventName, routeInfo = {}, smsScheduleInfo = {} } = data;
    const serviceOrderDetails = await getServiceOrder(serviceOrderId);
    serviceOrderDetails.routeInfo = {};
    serviceOrderDetails.smsDateScheduled = smsScheduleInfo.dateScheduled;
    // Skip SMS notifications for a store which is being used during automation testing
    if (
        process.env.AUTOMATION_TESTING_STORE &&
        Number(process.env.AUTOMATION_TESTING_STORE) === serviceOrderDetails.storeId
    ) {
        return null;
    }

    if (
        [
            orderSmsEvents.EN_ROUTE_TO_PICKUP,
            orderSmsEvents.EN_ROUTE_TO_DROP_OFF,
            orderSmsEvents.IN_TRANSIT_TO_STORE,
            orderSmsEvents.EN_ROUTE_ETA_UPDATED,
        ].includes(eventName)
    ) {
        serviceOrderDetails.routeInfo.eta = routeInfo.eta;
        serviceOrderDetails.routeInfo.stopNumber = routeInfo.stopNumber;
    }
    if (
        [orderSmsEvents.ROUTE_DELIVERY_CANCELED, orderSmsEvents.ROUTE_DELIVERY_COMPLETED].includes(
            eventName,
        )
    ) {
        return routeDeliverySmsNotificationInstance(serviceOrderDetails, eventName);
    }
    return orderSmsNotificationInstance(serviceOrderDetails, eventName);
}

async function orderSmsNotification(job, done) {
    try {
        const { eventName } = job.data;
        const orderSmsInstance = await getOrderSmsInstance(job.data);
        if (!orderSmsInstance) {
            done();
            return;
        }
        const result = await orderSmsInstance[orderSmsEventsMapping[eventName]]();
        // complete the scheduled jobs if any
        const scheduleJobManager = new ScheduleJobManager(null, null, job.id);
        await scheduleJobManager.completeScheduledJob();
        done(null, result);
    } catch (error) {
        LoggerHandler('error', error, {
            manualMessage: 'Error occurred in order sms notification queue.',
            job,
        });
        done(error);
    }
}

module.exports = exports = orderSmsNotification;

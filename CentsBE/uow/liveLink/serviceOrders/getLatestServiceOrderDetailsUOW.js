const { unixDateFormat, formatDateTimeWindow } = require('../../../helpers/dateFormatHelper');
const StoreCustomer = require('../../../models/storeCustomer');
const ServiceOrder = require('../../../models/serviceOrders');
const Order = require('../../../models/orders');
const RecurringSubscription = require('../../../models/recurringSubscription');
const Timings = require('../../../models/timings');
const pickupAndDeliveryDetails = require('./pickupAndDeliveryDetails');
const RuleService = require('../../../services/rruleService');
const JwtService = require('../../../services/tokenOperations/main');

const actionTypes = {
    VIEW: 'View',
    MANAGE: 'Manage',
    REORDER: 'Reorder',
};

const orderStatuses = {
    SUBMITTED: 'Submitted',
    DRIVER_PICKED_UP_FROM_CUSTOMER: 'Picked Up From Customer',
    READY_FOR_INTAKE: 'Ready For Intake',
    READY_FOR_PROCESSING: 'Ready For Processing',
    PROCESSING: 'Processing',
    READY_FOR_PICKUP: 'Ready For Pickup',
};

async function getStoreCustomer(payload, storeId) {
    const storeCustomer = await StoreCustomer.query()
        .select('id')
        .where('centsCustomerId', payload.currentCustomerId)
        .andWhere('storeId', storeId)
        .first();

    if (!storeCustomer) {
        return null;
    }

    return storeCustomer;
}

async function getLatestActiveServiceOrder(storeCustomer) {
    const serviceOrder = ServiceOrder.query()
        .select('id')
        .select('status')
        .where('storeCustomerId', storeCustomer.id)
        .andWhere('orderType', 'ONLINE')
        .andWhere('status', '!=', 'CANCELLED')
        .andWhere('status', '!=', 'CANCELED')
        .andWhere('status', '!=', 'COMPLETED')
        .orderBy('serviceOrders.id', 'desc')
        .limit(1)
        .first();

    if (!serviceOrder) {
        return null;
    }

    return serviceOrder;
}

function generateOrderToken(serviceOrderId) {
    const jwtService = new JwtService({ id: serviceOrderId });
    const serviceOrderToken = jwtService.tokenGenerator(process.env.JWT_SECRET_TOKEN_ORDER);
    return serviceOrderToken;
}

function formatTime(window, timeZone) {
    const formattedTimeData = {
        window: formatDateTimeWindow(window, timeZone, 'hh:mma'),
        weekDay: unixDateFormat(window[0] / 1000, timeZone, 'MMM Do'),
        date: unixDateFormat(window[0] / 1000, timeZone, 'ddd'),
    };

    return formattedTimeData;
}

async function getWindow(orderId, timeZone) {
    let time = {
        window: null,
        weekDay: null,
        date: null,
    };
    let scheduling = null;

    const details = await pickupAndDeliveryDetails({ orderId });

    if (Object.keys(details.delivery).length !== 0 && details.delivery.deliveredAt === null) {
        time = formatTime(details.delivery.deliveryWindow, timeZone);
        scheduling = 'Delivery scheduled';
    }

    if (Object.keys(details.pickup).length !== 0 && details.pickup.deliveredAt === null) {
        time = formatTime(details.pickup.deliveryWindow, timeZone);
        scheduling = 'Pickup scheduled';
    }

    return { time, scheduling };
}

async function getActiveOrderData(latestServiceOrderDetails, latestActiveServiceOrder) {
    const order = await Order.query()
        .select('id')
        .withGraphFetched('[store]')
        .where('orderableId', latestActiveServiceOrder.id)
        .andWhere('orderableType', 'ServiceOrder')
        .first();

    if (order) {
        const timeZone =
            order.store.settings && order.store.settings.timeZone
                ? order.store.settings.timeZone
                : 'America/New_York';

        const windowDetails = await getWindow(order.id, timeZone);

        latestServiceOrderDetails = {
            ...latestServiceOrderDetails,
            serviceOrderToken: generateOrderToken(latestActiveServiceOrder.id),
            orderStatus: orderStatuses[latestActiveServiceOrder.status],
            actionType: actionTypes.VIEW,
            deliveryType: windowDetails.deliveryType,
            scheduling: windowDetails.scheduling,
            time: windowDetails.time,
        };
    }
    return latestServiceOrderDetails;
}

async function getActiveRecurringSubscriptionDetails(storeId, centsCustomerId) {
    const activeRecurringSubscriptionDetails = await RecurringSubscription.query()
        .where('storeId', storeId)
        .withGraphFetched('[store.settings,address]')
        .andWhere('centsCustomerId', centsCustomerId)
        .andWhere('deletedAt', null)
        .first();

    if (!activeRecurringSubscriptionDetails) {
        return null;
    }

    return activeRecurringSubscriptionDetails;
}

async function getActiveRecurringSubscriptionData(
    activeRecurringSubscription,
    latestServiceOrderDetails,
) {
    const timeZone =
        activeRecurringSubscription.store.settings &&
        activeRecurringSubscription.store.settings.timeZone
            ? activeRecurringSubscription.store.settings.timeZone
            : 'America/New_York';

    const timings = await Timings.query()
        .findById(activeRecurringSubscription.pickupTimingsId)
        .returning('day');

    const ruleService = new RuleService(activeRecurringSubscription, timeZone, timings.day);

    const nextAvailablePickupWindow = await ruleService.nextAvailablePickupWindow();

    latestServiceOrderDetails = {
        ...latestServiceOrderDetails,
        actionType: actionTypes.MANAGE,
        time: activeRecurringSubscription.pickupWindow
            ? formatTime(nextAvailablePickupWindow, timeZone)
            : {
                  window: null,
                  weekDay: null,
                  date: null,
              },
    };

    return latestServiceOrderDetails;
}

function getRecentCompletedOrderData(payload, latestServiceOrderDetails) {
    const modifiers = payload.recentCompletedStandardOrder.details.serviceModifiers;

    for (let i = 0; i < modifiers.length - 1; i++) {
        modifiers[i] += ', ';
    }

    latestServiceOrderDetails = {
        ...latestServiceOrderDetails,
        actionType: actionTypes.REORDER,
        services: payload.recentCompletedStandardOrder.details.name,
        modifiers,
    };

    return latestServiceOrderDetails;
}

async function getLatestServiceOrderDetails(payload) {
    let latestServiceOrderDetails = {
        serviceOrderToken: null,
        orderStatus: null,
        actionType: null,
        services: null,
        modifiers: null,
        scheduling: null,
        time: {
            window: null,
            weekDay: null,
            date: null,
        },
    };

    const storeId = payload.ownDeliveryStore.storeId || payload.onDemandDeliveryStore.storeId;

    const storeCustomer = await getStoreCustomer(payload, storeId);

    if (storeCustomer) {
        const latestActiveServiceOrder = await getLatestActiveServiceOrder(storeCustomer);

        if (latestActiveServiceOrder) {
            latestServiceOrderDetails = await getActiveOrderData(
                latestServiceOrderDetails,
                latestActiveServiceOrder,
            );
        } else {
            const activeRecurringSubscription = await getActiveRecurringSubscriptionDetails(
                storeId,
                payload.currentCustomerId,
            );
            if (activeRecurringSubscription) {
                latestServiceOrderDetails = await getActiveRecurringSubscriptionData(
                    activeRecurringSubscription,
                    latestServiceOrderDetails,
                );
            } else {
                if (Object.keys(payload.recentCompletedStandardOrder).length !== 0) {
                    latestServiceOrderDetails = getRecentCompletedOrderData(
                        payload,
                        latestServiceOrderDetails,
                    );
                }
            }
        }
    }

    return latestServiceOrderDetails;
}

module.exports = exports = getLatestServiceOrderDetails;

// Packages
const { transaction } = require('objection');
const momenttz = require('moment-timezone');

// Models
const OrderDelivery = require('../../../models/orderDelivery');
const ServiceOrder = require('../../../models/serviceOrders');

// Constants
const { shiftType } = require('../../../constants/constants');

// Services & UoWs
const { getDeliveryWindowsWithEpochDate } = require('../../../services/shifts/queries/timings');
const sendTextMessageToCustomer = require('../../../uow/delivery/dropoff/sendTextMessageToCustomerUow');
const getOrderCodePrefix = require('../../../utils/getOrderCodePrefix');

/**
 * Returns the Date object of the next day.
 */
function getNextDay() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
}

/**
 * Format the incoming delivery information for the front-end.
 *
 * @param {Object} delivery
 * @param {String} storeName
 */
async function formatDeliveryData(delivery, storeName) {
    const serviceOrder = await ServiceOrder.query()
        .withGraphFetched('[serviceOrderBags]')
        .findById(delivery.order.orderableId);

    const deliveryData = {
        id: delivery.id,
        status: delivery.status,
        storeCustomerId: delivery.storeCustomerId,
        serviceOrderId: serviceOrder.id,
        thirdPartyDeliveryId: delivery.thirdPartyDeliveryId,
        address1: delivery.address1,
        address2: delivery.address2,
        city: delivery.city,
        firstLevelSubdivisionCode: delivery.firstLevelSubdivisionCode,
        postalCode: delivery.postalCode,
        instructions: delivery.instructions,
        customerName: delivery.customerName,
        customerPhoneNumber: delivery.customerPhoneNumber,
        customerEmail: delivery.customerEmail,
        totalDeliveryCost: delivery.totalDeliveryCost,
        deliveryWindow: delivery.deliveryWindow,
        type: delivery.type,
        orderCode: serviceOrder.orderCode,
        serviceOrderPlacedAt: serviceOrder.placedAt,
        bagCount: serviceOrder.serviceOrderBags.length,
        deliveredAt: delivery.deliveredAt,
        storeName,
        orderCodeWithPrefix: getOrderCodePrefix(serviceOrder),
    };

    return deliveryData;
}

/**
 * Get the current and next time window for own network deliveries based on the current time
 *
 * @param {Object} store
 * @param {String} timeZone
 */
async function getCurrentAndNextTimeWindow(store, timeZone) {
    const timeWindows = await getDeliveryWindowsWithEpochDate({
        storeId: store.id,
        type: shiftType.OWN_DELIVERY,
        timeZone,
    });
    const currentDate = new Date();

    const dayOfWeek = currentDate.getDay();
    const nextDay = getNextDay();
    const nextDayOfWeek = nextDay.getDay();
    const currentTimeWindow = timeWindows.filter((window) => window.day === dayOfWeek);
    const nextTimeWindow = timeWindows.filter((window) => window.day === nextDayOfWeek);

    return [currentTimeWindow, nextTimeWindow];
}

/**
 * Filter an array of deliveries based on window timestamo
 *
 * @param {String} incomingWindow
 * @param {Array} deliveries
 * @param {String} timeZone
 * @returns {Array}
 */
function filterDeliveriesByWindow(incomingWindow, deliveries, timeZone) {
    const window = { ...incomingWindow };
    const array = [];
    for (const delivery of deliveries) {
        const firstDeliveryWindowUnix = delivery.deliveryWindow[0] * 1;
        const secondDeliveryWindowUnix = delivery.deliveryWindow[1] * 1;

        const firstDeliveryWindow = momenttz(firstDeliveryWindowUnix)
            .tz(timeZone)
            .format('MMM Do hh:mm A');
        const secondDeliveryWindow = momenttz(secondDeliveryWindowUnix)
            .tz(timeZone)
            .format('MMM Do hh:mm A');
        const windowStart = momenttz(incomingWindow.startTime).format('MMM Do hh:mm A');
        const windowEnd = momenttz(incomingWindow.endTime).format('MMM Do hh:mm A');

        if (firstDeliveryWindow === windowStart && secondDeliveryWindow === windowEnd) {
            array.push(delivery);
        }
    }

    window.deliveries = array;

    return window;
}

/**
 * Set proper date based on today's date for a time window
 *
 * @param {String} incomingDate
 * @param {Number} day
 * @param {Number} month
 * @returns {String} timestamp of proper date
 */
function getProperDateForWindow(incomingDate, day, month) {
    return new Date(
        new Date(
            new Date(
                new Date().setHours(incomingDate.getUTCHours(), incomingDate.getMinutes()),
            ).setDate(day),
        ).setMonth(month),
    );
}

/**
 * Retrieve the human-readable delivery window for a given window
 *
 * @param {Object} window
 * @param {Number} incomingDay
 * @param {String} timeZone
 */
function retrieveTimeForWindow(window, incomingDay, timeZone) {
    const today = new Date();

    const tomorrow = getNextDay();

    const todayDay = today.getDay();
    const dayDifference = incomingDay - todayDay;
    const isNextDay = dayDifference === 1 || dayDifference === -6;
    const properDayToSet = isNextDay ? tomorrow.getDate() : today.getDate();
    const properMonthToSet = isNextDay ? tomorrow.getMonth() : today.getMonth();

    const incomingStartDate = new Date(window.startTime);
    const incomingEndDate = new Date(window.endTime);
    const startTime = getProperDateForWindow(incomingStartDate, properDayToSet, properMonthToSet);
    const endTime = getProperDateForWindow(incomingEndDate, properDayToSet, properMonthToSet);

    const currentMonth = momenttz(startTime).tz(timeZone).format('MMM');
    const currentDayOfMonth = momenttz(startTime).tz(timeZone).format('Do');
    const startHour = momenttz(startTime).format('hh:mm A');
    const endHour = momenttz(endTime).format('hh:mm A');

    return {
        window: `${currentMonth} ${currentDayOfMonth}, ${startHour}-${endHour}`,
        startTime: momenttz(startTime).format(),
        endTime: momenttz(endTime).format(),
        currentMonth,
        currentDayOfMonth,
        startHour,
        endHour,
    };
}

/**
 * Get a list of all 'OWN_DRIVER' deliveries ready for pickup/delivery
 *
 * The deliveries need to be grouped either by "today" or "tomorrow"
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getReadyOwnNetworkDeliveries(req, res, next) {
    try {
        const { currentStore } = req;
        let todayDeliveries;
        let tomorrowDeliveries;
        const storeSettings = await currentStore.getStoreSettings();

        const [currentWindow, nextWindow] = await getCurrentAndNextTimeWindow(
            currentStore,
            storeSettings.timeZone,
        );
        if (currentWindow.length && nextWindow.length) {
            const currentWindowTimings = currentWindow[0].timings.map((timing) =>
                retrieveTimeForWindow(timing, timing.day, storeSettings.timeZone),
            );
            const nextWindowTimings = nextWindow[0].timings.map((timing) =>
                retrieveTimeForWindow(timing, timing.day, storeSettings.timeZone),
            );

            const deliveries = await OrderDelivery.query()
                .withGraphFetched('[customer, order]')
                .where({
                    storeId: currentStore.id,
                    deliveryProvider: 'OWN_DRIVER',
                    status: 'SCHEDULED',
                });

            let formattedDeliveries = deliveries.map((delivery) =>
                formatDeliveryData(delivery, currentStore.name),
            );
            formattedDeliveries = await Promise.all(formattedDeliveries);

            todayDeliveries = currentWindowTimings.map((window) =>
                filterDeliveriesByWindow(window, formattedDeliveries, storeSettings.timeZone),
            );
            tomorrowDeliveries = nextWindowTimings.map((window) =>
                filterDeliveriesByWindow(window, formattedDeliveries, storeSettings.timeZone),
            );
        }

        return res.json({
            success: true,
            today: todayDeliveries || [],
            tomorrow: tomorrowDeliveries || [],
            timeZone: storeSettings.timeZone,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get the own network time windows for a given store
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getOwnNetworkTimeWindows(req, res, next) {
    try {
        const { currentStore } = req;

        const timeWindows = await getDeliveryWindowsWithEpochDate({
            storeId: currentStore.id,
            type: shiftType.OWN_DELIVERY,
        });

        return res.json({
            success: true,
            timeWindows,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Mark an OrderDelivery of type PICKUP as complete
 *
 * @param {Object} req
 * @param {Object} rex
 * @param {Object} next
 */
async function markPickupDeliveryAsComplete(req, res, next) {
    let trx = null;
    try {
        const { id } = req.body;
        const { serviceOrder } = req.constants;

        trx = await transaction.start(OrderDelivery.knex());

        const orderDelivery = await OrderDelivery.query(trx)
            .patch({
                status: 'COMPLETED',
                deliveredAt: new Date().toISOString(),
            })
            .findById(id)
            .returning('*');

        await trx.commit();

        const payload = {
            serviceOrder: serviceOrder[0],
            orderDelivery,
            trx,
        };
        await sendTextMessageToCustomer(payload);

        return res.json({
            success: true,
            delivery: orderDelivery,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

module.exports = exports = {
    getReadyOwnNetworkDeliveries,
    getOwnNetworkTimeWindows,
    markPickupDeliveryAsComplete,
};

const OrderDelivery = require('../../models/orderDelivery');
const { deliveryProviders, routeDeliveryStatuses } = require('../../constants/constants');
const deliveryWindowOuterWhereQuery = require('../../helpers/deliveryWindowOuterWhereQuery');
const getTimeStampRangeForTiming = require('../../utils/getTimeStampRangeForTiming');
const { statuses, orderDeliveryStatuses } = require('../../constants/constants');

function orderDeliveriesAndPickupQueryBuilder({ range, storeId, transaction, timing }) {
    return OrderDelivery.query(transaction)
        .select('type')
        .leftJoinRelated('[order.serviceOrder, routeDelivery]')
        .where('orderDeliveries.status', orderDeliveryStatuses.SCHEDULED)
        .where('orderDeliveries.storeId', storeId)
        .where('deliveryProvider', deliveryProviders.OWN_DRIVER)
        .where(deliveryWindowOuterWhereQuery(range))
        .where('timingsId', timing.id)
        .where((query) => {
            query
                .whereNotIn('routeDelivery.status', [
                    routeDeliveryStatuses.ASSIGNED,
                    routeDeliveryStatuses.IN_PROGRESS,
                ])
                .orWhereNull('routeDelivery.id');
        })
        .whereNotIn('order:serviceOrder.status', [statuses.CANCELLED, statuses.COMPLETED])
        .groupBy('type')
        .count();
}

function updateObjectWithCount(timingObject, counts) {
    const shallowCopy = timingObject;
    const pickupCount = counts.find((obj) => obj.type === 'PICKUP');
    const deliveryCount = counts.find((obj) => obj.type === 'RETURN');

    shallowCopy.pickupCount = pickupCount ? +pickupCount.count : 0;
    shallowCopy.deliveryCount = deliveryCount ? +deliveryCount.count : 0;
    return shallowCopy;
}

async function getDeliveryAndPickupCountUOW(payload) {
    try {
        const { todaysShiftsTimings, tomorrowsShiftTiming, transaction, storeId, today, store } =
            payload;

        const todaysSQLPromises = todaysShiftsTimings.map((timing) => {
            const range = getTimeStampRangeForTiming(
                today.toDate(),
                timing,
                store.settings.timeZone,
            );
            return orderDeliveriesAndPickupQueryBuilder({
                range,
                storeId,
                transaction,
                timing,
            });
        });

        const result = await Promise.all(todaysSQLPromises);

        todaysShiftsTimings.forEach((timing, index) => {
            const counts = result[index];
            updateObjectWithCount(timing, counts);
        });

        if (tomorrowsShiftTiming && tomorrowsShiftTiming.id) {
            const dateObj = today.clone();

            if (today.day() < +tomorrowsShiftTiming.day) {
                dateObj.day(+tomorrowsShiftTiming.day);
            } else {
                dateObj.add(1, 'week').day(+tomorrowsShiftTiming.day);
            }

            const range = getTimeStampRangeForTiming(
                dateObj.toDate(),
                tomorrowsShiftTiming,
                store.settings.timeZone,
            );

            const tomorrowsCount = await orderDeliveriesAndPickupQueryBuilder({
                range,
                storeId,
                transaction,
                timing: tomorrowsShiftTiming,
            });

            updateObjectWithCount(tomorrowsShiftTiming, tomorrowsCount);
        }

        return payload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = getDeliveryAndPickupCountUOW;

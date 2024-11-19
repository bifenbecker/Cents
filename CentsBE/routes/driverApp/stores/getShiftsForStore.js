const moment = require('moment');
const {
    locationType,
    routeStatuses,
    routeDeliveryStatuses,
    serviceOrderRouteDeliveryStatuses,
    hubOrderRouteDeliveryTypes: { TO_HUB, TO_STORE },
} = require('../../../constants/constants');

const getShiftsForStorePipeline = require('../../../pipeline/driverApp/stores/getShiftsForStorePipeline');

function responseMapper(result) {
    const {
        today: todaysDateObj,
        todaysShiftsTimings: todaysShiftTimings,
        tomorrowsShiftTiming: nextAvailableDayShiftTimings,
        store: originStore,
        past,
    } = result;
    const response = {
        today: [],
        nextAvailableDay: {},
    };

    function mapObject(isNextAvailableDay, timing) {
        const returnObj = {};
        const startTime = moment.utc(timing.startTime);
        const endTime = moment.utc(timing.endTime);

        if (isNextAvailableDay) {
            const dateObj = todaysDateObj.clone();

            if (dateObj.day() < +timing.day) {
                dateObj.day(+timing.day);
            } else {
                dateObj.add(1, 'week').day(+timing.day);
            }

            returnObj.window = `${dateObj.format('ddd MM/DD')} ${startTime.format(
                'h:mm A',
            )} - ${endTime.format('h:mm A')}`;
            returnObj.date = dateObj.format('MM/DD/YYYY');
        } else {
            returnObj.window = `Today ${startTime.format('h:mm A')} - ${endTime.format('h:mm A')}`;
            returnObj.date = todaysDateObj.format('MM/DD/YYYY');
        }

        returnObj.shiftTimingId = timing.id;
        returnObj.shiftName = timing.shift.name;
        returnObj.isHub = originStore.isHub;
        returnObj.deliveryCount = timing.deliveryCount || 0;
        returnObj.pickupCount = timing.pickupCount || 0;
        returnObj.residentialStoresCount = timing.residentialStoresCount || 0;
        returnObj.hubSpokeStoresCount = timing.hubSpokeStoresCount || 0;

        const routes = (timing.routes || []).map((route) => {
            const routeSummary = {
                residentialStoresCount: 0,
                hubSpokeStoresCount: 0,
                onlineOrdersCount: 0,
                delivery: {
                    scheduled: 0,
                    completed: 0,
                    canceled: 0,
                    residential: 0,
                    hubSpoke: 0,
                },
                pickup: {
                    scheduled: 0,
                    completed: 0,
                    canceled: 0,
                    residential: 0,
                    hubSpoke: 0,
                },
            };

            const {
                PICKED_UP: RD_PICKED_UP,
                CANCELED: RD_CANCELED,
                COMPLETED: RD_COMPLETED,
            } = routeDeliveryStatuses;

            const { PICKED_UP, DROPPED_OFF } = serviceOrderRouteDeliveryStatuses;

            route.routeDeliveries.reduce((summary, next) => {
                const summaryCopy = summary;
                const { routableType, orderDelivery, store, serviceOrderRouteDeliveries, status } =
                    next;
                if (routableType === 'OrderDelivery') {
                    summaryCopy.onlineOrdersCount += 1;
                    if (orderDelivery.type === 'RETURN') {
                        summaryCopy.delivery.scheduled += 1;
                        summaryCopy.delivery.canceled += +(status === RD_CANCELED);
                        summaryCopy.delivery.completed += +(status === RD_COMPLETED);
                    } else {
                        summaryCopy.pickup.scheduled += 1;
                        summaryCopy.pickup.canceled += +(status === RD_CANCELED);
                        summaryCopy.pickup.completed += +(
                            status === RD_PICKED_UP || status === RD_COMPLETED
                        );
                    }
                } else if (routableType === 'Store') {
                    summaryCopy.residentialStoresCount += +(
                        store.type === locationType.RESIDENTIAL
                    );

                    summaryCopy.hubSpokeStoresCount += +(store.type !== locationType.RESIDENTIAL);

                    if (store && serviceOrderRouteDeliveries) {
                        for (const serviceOrderRouteDelivery of serviceOrderRouteDeliveries) {
                            const { type, status } = serviceOrderRouteDelivery;

                            if (originStore.isHub) {
                                summaryCopy.pickup.scheduled += +(type === TO_HUB);
                                summaryCopy.delivery.scheduled += +(type === TO_STORE);
                                if (
                                    type === TO_HUB &&
                                    (status === PICKED_UP || status === DROPPED_OFF)
                                ) {
                                    summaryCopy.pickup.residential += +(
                                        store.type === locationType.RESIDENTIAL
                                    );
                                    summaryCopy.pickup.hubSpoke +=
                                        store.type !== locationType.RESIDENTIAL;
                                } else if (type === TO_STORE && status === DROPPED_OFF) {
                                    summaryCopy.delivery.residential += +(
                                        store.type === locationType.RESIDENTIAL
                                    );
                                    summaryCopy.delivery.hubSpoke +=
                                        store.type !== locationType.RESIDENTIAL;
                                }
                            } else {
                                summaryCopy.pickup.scheduled += +(type === TO_STORE);
                                summaryCopy.delivery.scheduled += +(type === TO_HUB);
                                if (
                                    type === TO_STORE &&
                                    (status === PICKED_UP || status === DROPPED_OFF)
                                ) {
                                    summaryCopy.pickup.hubSpoke += 1;
                                } else if (type === TO_HUB && status === DROPPED_OFF) {
                                    summaryCopy.delivery.hubSpoke += 1;
                                }
                            }
                        }
                    }
                }

                return summaryCopy;
            }, routeSummary);

            return {
                id: route.id,
                status: route.status,
                ...routeSummary,
            };
        });

        returnObj.route = routes.length ? routes[0] : null;

        returnObj.isCurrent = (timing.routes || []).some(
            (route) => route.status === routeStatuses.STARTED,
        );

        return returnObj;
    }

    response.timeZone = originStore.settings.timeZone || 'UTC';
    response.today = todaysShiftTimings.map(mapObject.bind(this, false));

    if (nextAvailableDayShiftTimings && nextAvailableDayShiftTimings.id) {
        response.nextAvailableDay = mapObject(true, nextAvailableDayShiftTimings);
    }
    response.day = todaysDateObj.day();
    response.past = past;
    return response;
}

module.exports = async function getShiftsForStores(req, res) {
    try {
        const { teamMemberId } = req.locals.decodedToken;

        const result = await getShiftsForStorePipeline({
            teamMemberId,
            storeId: req.params.storeId,
        });

        const response = responseMapper(result);

        res.json({
            success: true,
            ...response,
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

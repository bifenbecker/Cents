const { transaction } = require('objection');
const moment = require('moment-timezone');
const OrderDelivery = require('../../models/orderDelivery');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const getTimeStampRangeForTiming = require('../../utils/getTimeStampRangeForTiming');

const CustomQuery = require('../../services/customQuery');

function buildDeliveryWindow(timing, timeZone) {
    const today = moment.tz(timeZone);
    const dateObj = today.clone();
    // TODO: Not required. We have to remove once we get the sign-off from QA on pre-production
    /*
    if (today.day() < +timing.day) {
        dateObj.day(+timing.day);
    } else {
        dateObj.add(1, 'week').day(+timing.day);
    } */
    const range = getTimeStampRangeForTiming(dateObj.toDate(), timing, timeZone);
    return range;
}

async function movePastOrderDeliveriesToNextAvailableDay() {
    let trx = null;
    try {
        trx = await transaction.start(OrderDelivery.knex());
        const today = moment.tz('UTC');
        const currentDay = today.day();
        const pastOrderDeliveriesWithNewTimingsQuery = new CustomQuery(
            'driver-app/reschedule-deliveries/deliveries-with-next-available-window.sql',
            {
                currentDay,
            },
        );
        const pastOrderDeliveriesWithNewTimings =
            await pastOrderDeliveriesWithNewTimingsQuery.execute();

        const promiseArray = pastOrderDeliveriesWithNewTimings
            .map((orderDelivery) => {
                let infoMsg;
                if (!orderDelivery.id || !orderDelivery.newTimingId) {
                    infoMsg = `No own driver timings found for the orderDelivery::::: ${orderDelivery.id}`;
                    LoggerHandler('info', infoMsg);
                    return null;
                }

                infoMsg = `orderDelivery for id: ${orderDelivery.id} being scheduled at ${orderDelivery.startTime} for timings id ${orderDelivery.newTimingId}`;
                LoggerHandler('info', infoMsg);

                return OrderDelivery.query(trx)
                    .findOne({ id: orderDelivery.id })
                    .patch({
                        deliveryWindow: buildDeliveryWindow(
                            {
                                id: orderDelivery.newTimingId,
                                startTime: orderDelivery.startTime,
                                endTime: orderDelivery.endTime,
                            },
                            orderDelivery.timeZone,
                        ),
                        timingsId: orderDelivery.newTimingId,
                    });
            })
            .filter((po) => po);
        await Promise.all(promiseArray);
        await trx.commit();
    } catch (err) {
        LoggerHandler('error', err);
        if (trx) {
            await trx.rollback();
        }
        throw err;
    }
}

module.exports = movePastOrderDeliveriesToNextAvailableDay;

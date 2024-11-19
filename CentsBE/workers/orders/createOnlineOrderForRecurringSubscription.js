const momentTz = require('moment-timezone');

const RecurringSubscription = require('../../models/recurringSubscription');
const ServiceOrderRecurringSubscription = require('../../models/serviceOrderRecurringSubscription');
const RecurringOrderLog = require('../../models/recurringOrderLog');

const RRuleService = require('../../services/rruleService');
const RecurringOnlineOrderClone = require('../../builders/cloning/recurringOnlineOrderClone');
const CreateOnlineOrderPipeLine = require('../../pipeline/pickup/createOnlineOrder');
const RecurringSubscriptionsTimeZoneAndStoreIds = require('../../services/queries/recurringSubscriptionsTimeZoneAndStoreIds');

const { toDayWithTimezone } = require('../../helpers/dateFormatHelper');
const eventEmitter = require('../../config/eventEmitter');
const { orderSmsEvents } = require('../../constants/constants');

async function getTimeZonesWithSubscriptionIdsToUpdate() {
    const distinctTimezones = await new RecurringSubscriptionsTimeZoneAndStoreIds().run();

    return distinctTimezones && distinctTimezones.length
        ? distinctTimezones.filter(({ timeZone }) => {
              const currentTime = momentTz().tz(timeZone);
              const currentHour = currentTime.hour();
              const currentMinutes = currentTime.minutes();
              const amOrPm = currentTime.format('a');
              return (
                  currentHour === 19 &&
                  amOrPm === 'pm' &&
                  currentMinutes >= 0 &&
                  currentMinutes <= 5
              );
          })
        : [];
}

async function cloneLastRecurringOrder(recurringSubscription, timeZone) {
    const recurringOrderLogObj = {
        payload: null,
        recurringSubscriptionId: recurringSubscription.id,
        serviceOrderId: null,
        clonedFromId: null,
        stack: null,
        errorMessage: null,
    };

    try {
        const rruleService = new RRuleService(
            recurringSubscription,
            timeZone,
            recurringSubscription.pickupTimingDay,
        );
        const [{ serviceOrderId }] = await ServiceOrderRecurringSubscription.query()
            .where({ recurringSubscriptionId: recurringSubscription.id })
            .orderBy('id', 'DESC')
            .limit('1');
        // Add cloned from id to logger
        recurringOrderLogObj.clonedFromId = serviceOrderId;

        if (await rruleService.canCreateNextRecurringOrder()) {
            const orderCloneBuilder = new RecurringOnlineOrderClone(serviceOrderId);
            const payload = await orderCloneBuilder.buildForPipeline();
            // Add payload to logger
            recurringOrderLogObj.payload = payload;
            const output = await CreateOnlineOrderPipeLine(payload);
            // Add newly created order to log
            recurringOrderLogObj.serviceOrderId = output.serviceOrder.id;
            eventEmitter.emit(
                'orderSmsNotification',
                orderSmsEvents.RECURRING_ONLINE_ORDER,
                output.serviceOrder.id,
            );
        } else {
            throw new Error('Could not create order');
        }
    } catch (e) {
        // log messages and stack.
        recurringOrderLogObj.stack = e.stack;
        recurringOrderLogObj.errorMessage = e.message;
    } finally {
        // Logging clone related things here.
        await RecurringOrderLog.query().insert(recurringOrderLogObj);
    }
}

async function createOnlineOrderForRecurringSubscription() {
    const tzsWithSusbscriptions = await getTimeZonesWithSubscriptionIdsToUpdate();
    if (tzsWithSusbscriptions.length) {
        tzsWithSusbscriptions.forEach(async (tzWithSusbscriptions) => {
            const { recurringSubscriptionIds, timeZone } = tzWithSusbscriptions;
            const tomorrowDay = toDayWithTimezone(momentTz().add(1, 'day'), timeZone);

            const recurringSusbcriptionsForStores = await RecurringSubscription.query()
                .select('recurringSubscriptions.*', 'pickup.day as pickupTimingDay')
                .withGraphJoined('[pickup]')
                .whereIn('recurringSubscriptions.id', recurringSubscriptionIds)
                .where('pickup.day', tomorrowDay);

            await Promise.all(
                recurringSusbcriptionsForStores.map((recurringSubscription) =>
                    cloneLastRecurringOrder(recurringSubscription, timeZone),
                ),
            );
        });
    }
}

module.exports = exports = createOnlineOrderForRecurringSubscription;

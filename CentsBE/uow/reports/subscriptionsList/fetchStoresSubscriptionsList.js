const CustomQuery = require('../../../services/customQuery');
const { dateFormat } = require('../../../helpers/dateFormatHelper');
const RRuleService = require('../../../services/rruleService');

async function fetchStoresSubscriptionList(payload) {
    const {
        options: { stores },
    } = payload;
    const newPayload = payload;
    newPayload.subscriptionsList = [];
    const customQueryObject = new CustomQuery('subscriptions-list.sql', {
        stores,
    });
    const subscriptions = await customQueryObject.execute();
    if (subscriptions.length) {
        newPayload.subscriptionsList = await Promise.all(
            subscriptions.map(async (subscription) => {
                const {
                    customerName,
                    pickupWindow,
                    deliveryWindow,
                    pickupDay,
                    deliveryDay,
                    totalOrdersValue = 0,
                    avgOrderValue = 0,
                    storeTimeZone,
                    locationName,
                    deliveryZone,
                    serviceType,
                    startedDate,
                } = subscription;
                const rruleService = new RRuleService(subscription, storeTimeZone);
                const nextAvailablePickupWindow = await rruleService.nextAvailablePickupWindow(
                    true,
                );
                const nextPickup = dateFormat(
                    Number(nextAvailablePickupWindow[0]),
                    storeTimeZone,
                    'MM/DD/YYYY',
                );
                const interval = rruleService.getInterval;
                return {
                    customerName,
                    frequency: interval === 1 ? 'Weekly' : `${interval} Weeks`,
                    pickupDay,
                    deliveryDay,
                    totalOrdersValue,
                    avgOrderValue,
                    nextPickup,
                    pickupWindow,
                    deliveryWindow,
                    locationName,
                    deliveryZone,
                    serviceType,
                    startedDate,
                };
            }),
        );
    }
    return newPayload;
}
module.exports = exports = fetchStoresSubscriptionList;

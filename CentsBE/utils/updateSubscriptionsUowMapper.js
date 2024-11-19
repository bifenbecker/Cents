const deleteSubscription = require('../uow/recurringSubscriptions/deleteSubscription');
const updateSubscriptionInterval = require('../uow/recurringSubscriptions/updateSubscriptionInterval');
const reinstateNextPickup = require('../uow/recurringSubscriptions/reinstateNextPickup');
const cancelNextPickup = require('../uow/recurringSubscriptions/cancelNextPickup');
const getSubscriptionDetails = require('../uow/recurringSubscriptions/getMappedSubscriptionDetails');

const getPermittedParams = require('./permittedParams');

const updateSubscriptionsUowMapper = (payload) => {
    const permittedParams = ['isDeleted', 'cancelNextPickup', 'reinstateNextPickup', 'interval'];
    const recurringSubscriptionsPayload = getPermittedParams(payload, permittedParams);
    const uows = [];

    if (recurringSubscriptionsPayload.isDeleted) {
        uows.push(deleteSubscription);
    } else if (recurringSubscriptionsPayload.cancelNextPickup) {
        uows.push(cancelNextPickup);
    } else if (recurringSubscriptionsPayload.reinstateNextPickup) {
        uows.push(reinstateNextPickup);
    } else if (recurringSubscriptionsPayload.interval) {
        uows.push(updateSubscriptionInterval);
    }
    uows.push(getSubscriptionDetails);
    return uows;
};

module.exports = exports = updateSubscriptionsUowMapper;

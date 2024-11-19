const ServiceOrderRecurringSubscription = require('../../../models/serviceOrderRecurringSubscription');

const getServiceOrderRecurringSubscription = async (payload) => {
    const { serviceOrderId, transaction } = payload;
    if (!serviceOrderId) return payload;

    const serviceOrderRecurringSubscription = await ServiceOrderRecurringSubscription.query(
        transaction,
    )
        .withGraphJoined('[recurringSubscription]')
        .findOne({
            serviceOrderId,
        });
    payload.serviceOrderRecurringSubscription = serviceOrderRecurringSubscription || null;
    payload.subscription = serviceOrderRecurringSubscription
        ? serviceOrderRecurringSubscription.recurringSubscription
        : null;
    return payload;
};

module.exports = exports = getServiceOrderRecurringSubscription;

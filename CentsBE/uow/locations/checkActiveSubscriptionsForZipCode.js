const { raw } = require('objection');
const RecurringSubscriptions = require('../../models/recurringSubscription');

const checkActiveSubscriptionsForZipCodes = async (payload) => {
    try {
        const { zipCodes, storeId, transaction } = payload;
        const newPayload = payload;

        const activeSubscriptions = await RecurringSubscriptions.query(transaction)
            .select(raw('distinct("centsCustomerAddresses"."postalCode")'))
            .innerJoin(
                'centsCustomerAddresses',
                'centsCustomerAddresses.id',
                'recurringSubscriptions.centsCustomerAddressId',
            )
            .whereNull('recurringSubscriptions.deletedAt')
            .where('recurringSubscriptions.storeId', storeId)
            .whereIn('centsCustomerAddresses.postalCode', zipCodes);

        const activeSubscriptionZipCodes = activeSubscriptions.map(({ postalCode }) => postalCode);
        newPayload.zipCodesForRecurringSubscription = activeSubscriptionZipCodes || [];
        return newPayload;
    } catch (error) {
        throw Error(error);
    }
};

module.exports = exports = checkActiveSubscriptionsForZipCodes;

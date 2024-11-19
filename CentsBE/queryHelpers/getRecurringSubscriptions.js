const ServicePrices = require('../models/servicePrices');

async function getRecurringSubscriptions(serviceIds) {
    return ServicePrices.query()
        .select('servicePrices.serviceId')
        .countDistinct({ recurringSubscriptionsCount: 'recurringSubscriptions.id' })
        .leftJoin('recurringSubscriptions', function leftJoinOn() {
            this.on('servicePrices.id', 'recurringSubscriptions.servicePriceId').onNull(
                'recurringSubscriptions.deletedAt',
            );
        })
        .whereIn('servicePrices.serviceId', serviceIds)
        .groupBy('servicePrices.serviceId')
        .havingRaw('COUNT("recurringSubscriptions"."id") > 0');
}

module.exports = exports = {
    getRecurringSubscriptions,
};

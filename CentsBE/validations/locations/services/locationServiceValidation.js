const knex = require('knex');
const ServicePrices = require('../../../models/servicePrices');
const { getRecurringSubscriptions } = require('../../../queryHelpers/getRecurringSubscriptions');

async function validateRequest(req, res, next) {
    try {
        const { storeId, deliveryServiceIds } = req.body;

        if (deliveryServiceIds && deliveryServiceIds.length) {
            const storeServices = await ServicePrices.query()
                .select(knex.raw('ARRAY_AGG("servicePrices"."serviceId") as serviceIds'))
                .findOne({ storeId, isDeliverable: true })
                .groupBy('storeId');
            const deliverableServiceIds = storeServices ? storeServices.serviceids : [];
            const removedServiceIds = deliverableServiceIds.filter(
                (id) => !deliveryServiceIds.includes(id),
            );

            if (removedServiceIds.length > 0) {
                const servicesSubscriptions = await getRecurringSubscriptions(removedServiceIds);
                if (servicesSubscriptions && servicesSubscriptions.length > 0) {
                    res.status(400).json({
                        success: false,
                        error: 'Cannot toggle the services because of some active subscriptions associated to it.',
                        type: 'ACTIVE_SUBSCRIPTIONS',
                        recurringSubscriptions: servicesSubscriptions,
                    });
                    return;
                }
            }
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

const { map, filter } = require('lodash');
const { getRecurringSubscriptions } = require('../../queryHelpers/getRecurringSubscriptions');
const ServicePrices = require('../../models/servicePrices');

async function validateRequest(req, res, next) {
    try {
        const { prices } = req.body;

        const priceIds = map(
            filter(prices, (price) => !price.isDeliverable),
            (price) => price.id,
        );

        const services = await ServicePrices.query().select('serviceId').whereIn('id', priceIds);
        const serviceIds = map(services, (service) => service.serviceId);
        if (serviceIds && serviceIds.length) {
            const servicesSubscriptions = await getRecurringSubscriptions(serviceIds);
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
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

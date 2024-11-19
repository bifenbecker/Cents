const ServicePrices = require('../../models/servicePrices');

const updateServicePriceUow = async (payload) => {
    try {
        const { tierId, serviceId, field, value } = payload;
        const isActiveService = await ServicePrices.query().findOne({
            pricingTierId: tierId,
            serviceId,
        });
        if (isActiveService) {
            payload.updatedServicePrice = await ServicePrices.query()
                .patch({
                    [field]: value,
                    isDeliverable:
                        field === 'isFeatured' && !value ? false : isActiveService.isDeliverable,
                })
                .findById(isActiveService.id)
                .returning('*');
        }

        return payload;
    } catch (error) {
        throw Error(error);
    }
};
module.exports = exports = updateServicePriceUow;

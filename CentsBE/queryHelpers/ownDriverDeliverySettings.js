const ServicesMaster = require('../models/services');

class OwnDriverDeliverySettingsQuery {
    constructor(storeId) {
        this.storeId = storeId;
    }

    setDeliveryTierIds(ids) {
        this.deliveryTierIds = ids;
    }

    async deliveryTierServicesCount() {
        const deliveryTierServicesCount = this.deliveryTierIds.length
            ? await ServicesMaster.query()
                  .countDistinct('servicesMaster.id')
                  .leftJoin('servicePrices', 'servicePrices.serviceId', 'servicesMaster.id')
                  .whereIn('pricingTierId', this.deliveryTierIds)
                  .andWhere('servicePrices.isFeatured', true)
                  .andWhere('servicePrices.isDeliverable', true)
                  .andWhere('isDeleted', false)
                  .andWhere('servicePrices.deletedAt', null)
                  .first()
            : { count: 0 };
        return deliveryTierServicesCount;
    }

    async mapZoneTiers(zones) {
        zones = await Promise.all(
            zones.map(async (zone) => {
                if (zone.deliveryTier) {
                    this.deliveryTierIds.push(zone.deliveryTier.id);
                }
                zone.deliveryTier = zone.deliveryTier || {};
                return zone;
            }),
        );
        return zones;
    }
}
module.exports = exports = OwnDriverDeliverySettingsQuery;

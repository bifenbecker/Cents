const isEmpty = require('lodash/isEmpty');
const ServicesMaster = require('../models/services');
const Zones = require('../models/zone');
const BusinessSettings = require('../models/businessSettings');
const Store = require('../models/store');

/**
 * Set isGeneralDeliverySettingsEnabled if entire general delivery settings are configured.
 *
 * @param {Object} payload
 */

const getIsGeneralDeliverySettingsEnabled = async (payload) => {
    const { storeSettings, driverSettings } = payload;

    if (isEmpty(storeSettings)) {
        return false;
    }

    const store = await Store.query().findById(storeSettings.storeId);

    const businessSettings = await BusinessSettings.query().findOne({
        businessId: store?.businessId,
    });

    let areGeneralDeliverySettingsConfigured = false;

    if (storeSettings.deliveryPriceType === 'RETAIL') {
        const services = await ServicesMaster.query()
            .select('servicesMaster.id')
            .leftJoin('servicePrices', 'servicePrices.serviceId', 'servicesMaster.id')
            .where('storeId', storeSettings.storeId)
            .andWhere('servicePrices.isFeatured', true)
            .andWhere('servicePrices.isDeliverable', true)
            .andWhere('servicePrices.deletedAt', null)
            .andWhere('isDeleted', false);
        areGeneralDeliverySettingsConfigured = !!services.length;
    } else if (storeSettings.deliveryPriceType === 'DELIVERY_TIER') {
        if (driverSettings.hasZones) {
            const zones = await Zones.query().where({
                ownDeliverySettingsId: driverSettings.id,
                deliveryTierId: null,
            });
            areGeneralDeliverySettingsConfigured = !zones.length;
        } else {
            areGeneralDeliverySettingsConfigured = !!storeSettings.deliveryTierId;
        }
    }

    if (!!businessSettings?.dryCleaningEnabled) {
        return areGeneralDeliverySettingsConfigured && storeSettings.deliveryEnabled;
    }

    return (
        areGeneralDeliverySettingsConfigured &&
        storeSettings.deliveryEnabled &&
        !!storeSettings.turnAroundInHours
    );
};

module.exports = exports = {
    getIsGeneralDeliverySettingsEnabled,
};

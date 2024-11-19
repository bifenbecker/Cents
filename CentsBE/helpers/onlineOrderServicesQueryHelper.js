const Zones = require('../models/zone');

const StoreQuery = require('../queryHelpers/store');

const { deliveryPriceTypes } = require('../constants/constants');

async function getQueryParamsforServices(businessCustomer, storeId, zipCode) {
    const payload = { queryColumn: 'storeId', queryColumnValue: storeId };

    const store = new StoreQuery(storeId);
    const ownDeliverySettings = await store.ownDeliverySettings();
    const onDemandSettings = await store.onDemandSettings();
    const { deliveryPriceType, deliveryTierId } = await store.settings();

    if (businessCustomer && businessCustomer.isCommercial && businessCustomer.commercialTierId) {
        payload.queryColumn = 'pricingTierId';
        payload.queryColumnValue = businessCustomer.commercialTierId;
    } else if (ownDeliverySettings && deliveryPriceType === deliveryPriceTypes.DELIVERY_TIER) {
        const { hasZones, id } = ownDeliverySettings;
        if (!hasZones) {
            if (deliveryTierId) {
                payload.queryColumn = 'pricingTierId';
                payload.queryColumnValue = deliveryTierId;
            }
        } else {
            const zone = await Zones.query()
                .where('ownDeliverySettingsId', id)
                .whereNull('deletedAt')
                .whereRaw('? = ANY(zones."zipCodes")', [zipCode])
                .first();
            if (zone && zone.deliveryTierId) {
                payload.queryColumn = 'pricingTierId';
                payload.queryColumnValue = zone.deliveryTierId;
            } else if (onDemandSettings && onDemandSettings.doorDashEnabled) {
                // fallback to first zone delivery tier for ondemand when zipcode not matches with zones zipcodes
                const zone = await Zones.query()
                    .where('ownDeliverySettingsId', id)
                    .whereNull('deletedAt')
                    .whereNotNull('deliveryTierId')
                    .orderBy('id')
                    .first();
                if (zone) {
                    payload.queryColumn = 'pricingTierId';
                    payload.queryColumnValue = zone.deliveryTierId;
                }
            }
        }
    } else if (
        onDemandSettings &&
        onDemandSettings.doorDashEnabled &&
        deliveryTierId &&
        deliveryPriceType === deliveryPriceTypes.DELIVERY_TIER
    ) {
        payload.queryColumn = 'pricingTierId';
        payload.queryColumnValue = deliveryTierId;
    }
    return payload;
}

module.exports = { getQueryParamsforServices };

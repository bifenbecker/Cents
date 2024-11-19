const CustomQuery = require('../../services/customQuery');

/**
 * The query would return this data.
 * id: { type: 'integer' },
 * businessId: { type: 'integer' },
 * name: { type: 'keyword' },
 * googlePlacesId: { type: 'keyword' },
 * isArchived: { type: 'boolean' },
 * zipCodes: { type: 'keyword' },
 * deliveryEnabled: { type: 'boolean' },
 * offersOwnDelivery: { type: 'boolean' },
 * offersCentsDelivery: { type: 'boolean' },
 * deliveryFeeInCents: { type: 'integer' },
 * returnDeliveryFeeInCents: { type: 'integer' },
 * subsidyInCents: { type: 'integer' },
 * returnOnlySubsidyInCents: { type: 'integer' },
 * uberStoreUuid: { type: 'keyword' },
 * pin: { type: 'geo_point' },
 * doorDashEnabled: { type: 'boolean' },
 * autoScheduleReturnEnabled: { type: 'boolean' },
 * customLiveLinkHeader: { type: 'text' },
 * customLiveLinkMessage: { type: 'text' },
 */

async function getStoreIndexData(storeId) {
    const customQueryObject = new CustomQuery('es-store-data.sql', { storeId });
    const [store] = await customQueryObject.execute();

    const { pin, ...rest } = store;
    if (pin.lat) {
        return {
            ...rest,
            pin,
        };
    }
    return rest;
}

module.exports = exports = { getStoreIndexData };

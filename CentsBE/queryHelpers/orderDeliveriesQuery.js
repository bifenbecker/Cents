const OwnDeliverySettings = require('../models/ownDeliverySettings');

async function includeZoneNameInOrderDelivery(orderDelivery) {
    if (orderDelivery.deliveryProvider === 'DOORDASH') {
        return;
    }

    const ownDeliverySettings = await OwnDeliverySettings.query()
        .withGraphFetched('[zones]')
        .findOne({
            storeId: orderDelivery.storeId,
            active: true,
            hasZones: true,
        });

    if (!ownDeliverySettings || !ownDeliverySettings.zones || !ownDeliverySettings.zones.length) {
        return;
    }

    const zone = ownDeliverySettings.zones.find((zone) =>
        zone.zipCodes.includes(orderDelivery.postalCode),
    );
    if (zone) {
        orderDelivery.zoneName = zone.name;
    }
}

module.exports = exports = {
    includeZoneNameInOrderDelivery,
};

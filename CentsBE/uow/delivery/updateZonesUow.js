const Zone = require('../../models/zone');

async function updateZonesUow(payload) {
    try {
        const { zones, transaction } = payload;
        if (zones && zones.length) {
            await Promise.all(
                zones.map(async (zone) => {
                    await Zone.query(transaction)
                        .patch({
                            deliveryTierId: zone.deliveryTierId,
                        })
                        .findById(zone.id);
                }),
            );
        }
        return payload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = updateZonesUow;

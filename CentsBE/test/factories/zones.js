const { factory } = require('factory-girl');
const Zones = require('../../models/zone');
require('./ownDeliverySettings');
require('./pricingTiers');

factory.define('zone', Zones, {
    name: factory.sequence('Zones.name', (n) => `zone-${n}`),
    ownDeliverySettingsId: factory.assoc('ownDeliverySetting', 'id'),
    zipCodes: [27565, 58282],
    deliveryTierId: factory.assoc('pricingTierDelivery', 'id'),
});

module.exports = exports = factory;

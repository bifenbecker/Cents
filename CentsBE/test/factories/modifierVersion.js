const { factory } = require('factory-girl');
const ModifierVersion = require('../../models/modifierVersions');
require('./laundromatBusinesses');

factory.define('modifierVersion', ModifierVersion, {
    modifierId: factory.assoc('modifier', 'id'),
    name: 'Rin',
    description: 'Rin modifier',
    price: 10,
    pricingType: 'PER_POUND',
});

module.exports = exports = factory;

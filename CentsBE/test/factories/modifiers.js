const { factory } = require('factory-girl');
const Modifier = require('../../models/modifiers');
require('./laundromatBusinesses');

factory.define('modifier', Modifier, {
    businessId: factory.assoc('laundromatBusiness', 'id'),
    name: 'Rin',
    description: 'Rin modifier',
    price: 10,
    pricingType: factory.chance('pickone', ['FIXED_PRICE', 'PER_POUND']),
});

factory.extend(
    'modifier',
    'modifierAndModifierVersion',
    {},
    {
        afterCreate: async (modifier) => {
            const modifierVersion = await factory.create('modifierVersion', {
                name: modifier.name,
                description: modifier.description,
                price: modifier.price,
                modifierId: modifier.id,
                pricingType: modifier.pricingType,
            });
            const updatedModifier = await Modifier.query()
                .patch({
                    latestModifierVersion: modifierVersion.id,
                })
                .findById(modifier.id)
                .returning('*');
            return {
                modifier: updatedModifier,
                modifierVersion,
            };
        },
    },
);

factory.extend('modifier', 'arielModifier', {
    name: 'Ariel',
    description: 'ariel modifier',
    price: 10,
});

factory.extend('modifier', 'surfExcelModifier', {
    name: 'Surf Excel',
    description: 'surf excel modifier',
    price: 10,
});

module.exports = exports = factory;

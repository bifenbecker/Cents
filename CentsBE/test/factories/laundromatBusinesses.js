const { factory } = require('factory-girl');
const faker = require('faker');
const LaundromatBusiness = require('../../models/laundromatBusiness');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');

require('./users');

factory.define(
    FN.laundromatBusiness,
    LaundromatBusiness,
    async () => {
        await factory.create(FN.serviceCategoryType);

        return {
            userId: factory.assoc(FN.user, 'id'),
            name: faker.random.word(),
            city: factory.chance('city', { country: 'us' }),
            state: factory.chance('state', { country: 'us' }),
            zipCode: faker.address.zipCode(),
            address: factory.chance('address', { country: 'us' }),
            uuid: faker.random.uuid(),
        }
    },
    {
        afterCreate: async (model) => {
            await factory.create(FN.businessSetting, {
                businessId: model.id,
                dryCleaningEnabled: false,
            });
            
            return model;
        },
    },
);

module.exports = exports = factory;

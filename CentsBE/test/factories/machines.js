const { factory } = require('factory-girl');
const faker = require('faker');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
const Machine = require('../../models/machine');
require('./machineTypes');
require('./machineModels');
require('./stores');
require('./users');
require('./devices');
require('./pairings');

factory.define(FACTORIES_NAMES.machine, Machine, {
    storeId: factory.assoc(FACTORIES_NAMES.store, 'id'),
    modelId: factory.assoc(FACTORIES_NAMES.machineModel, 'id'),
    userId: factory.assoc(FACTORIES_NAMES.userWithBusinessOwnerRole, 'id'),
    name: faker.random.word(),
    serialNumber: faker.random.uuid(),
    isActive: true,
    turnTimeInMinutes: factory.chance('integer', { min: 10, max: 69 }),
    origin: faker.random.word(),
});

factory.extend(
    FACTORIES_NAMES.machine,
    FACTORIES_NAMES.machineWasher,
    {
        modelId: factory.assoc(FACTORIES_NAMES.machineModelWasherType, 'id'),
    },
    {
        afterCreate: async (model) => {
            await factory.create(FACTORIES_NAMES.machinePricing, {
                machineId: model.id,
            });
            return model;
        },
    },
);

factory.extend(
    FACTORIES_NAMES.machineWasher,
    FACTORIES_NAMES.machineWasherWithPairedOnlineDevice,
    {
        serialNumber: faker.random.uuid(),
    },
    {
        afterCreate: async (model) => {
            const device = await factory.create(FACTORIES_NAMES.devicePairedOnline, {});
            await factory.create(FACTORIES_NAMES.pairing, {
                deviceId: device.id,
                machineId: model.id,
            });
            await factory.create(FACTORIES_NAMES.machinePricing, {
                machineId: model.id,
            });
            return model;
        },
    },
);

factory.extend(
    FACTORIES_NAMES.machine,
    FACTORIES_NAMES.machineDryer,
    {
        modelId: factory.assoc(FACTORIES_NAMES.machineModelDryerType, 'id'),
    },
    {
        afterCreate: async (model) => {
            await factory.create(FACTORIES_NAMES.machinePricing, {
                machineId: model.id,
            });
            return model;
        },
    },
);

module.exports = exports = factory;

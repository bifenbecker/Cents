const factoryGirl = require('factory-girl');
const faker = require('faker');
const MachineConfiguration = require('../../mongooseModels/machineConfiguration');
const factory = factoryGirl.factory;
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
require('./machines');

const mongooseAdapter = new factoryGirl.MongooseAdapter();

factory.define(FACTORIES_NAMES.machineConfiguration, MachineConfiguration, {
    LMID: faker.random.number(),
    LaundryMachineID: factory.assoc(FACTORIES_NAMES.machine, 'id'),
    CoinTotal: faker.random.number(),
});

factory.setAdapter(mongooseAdapter, 'machineConfiguration');

module.exports = exports = factory;

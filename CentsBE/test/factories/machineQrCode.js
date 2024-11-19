const { factory } = require('factory-girl');
const MachineQrCodeModel = require('../../models/machineQrCode');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');

factory.define(FACTORIES_NAMES.machineQrCode, MachineQrCodeModel, {
    id: 1,
    hash: '12345',
});

module.exports = exports = factory;

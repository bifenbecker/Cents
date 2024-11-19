const { factory } = require('factory-girl');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
const MachinePaymentType = require('../../models/machinePaymentType');
const { MACHINE_PAYMENT_TYPES } = require('../../constants/constants');

factory.define(FACTORIES_NAMES.machinePaymentType, MachinePaymentType, {
    type: MACHINE_PAYMENT_TYPES.APP,
});

module.exports = exports = factory;

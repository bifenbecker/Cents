const { factory } = require('factory-girl');
const faker = require('faker');
const Turn = require('../../models/turns');
const { turnStatuses, serviceTypes, paymentStatuses } = require('../../constants/constants');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
require('./storeCustomer');
require('./users');
require('./stores');
require('./machines');
require('./devices');

factory.define(FACTORIES_NAMES.turn, Turn, {
    storeId: factory.assoc(FACTORIES_NAMES.store, 'id'),
    storeCustomerId: factory.assoc(FACTORIES_NAMES.storeCustomer, 'id'),
    machineId: factory.assoc(FACTORIES_NAMES.machine, 'id'),
    deviceId: factory.assoc(FACTORIES_NAMES.device, 'id'),
    userId: factory.assoc(FACTORIES_NAMES.user, 'id'),
    serviceType: serviceTypes.FULL_SERVICE,
    status: turnStatuses.COMPLETED,
    paymentStatus: paymentStatuses.PAID,
    origin: 'EMPLOYEE_TAB',
    technicianName: faker.name.findName(),
});

module.exports = exports = factory;

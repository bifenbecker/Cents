const { factory } = require('factory-girl');
const ServiceOrderBags = require('../../models/serviceOrderBags');
const faker = require('faker');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');
require('./serviceOrders');

factory.define(FN.serviceOrderBag, ServiceOrderBags, {
    barcode: faker.random.words(2),
    barcodeStatus: 'PROCESSING',
    isActiveBarcode: false,
    description: null,
    notes: faker.random.words(2),
    serviceOrderId: factory.assoc(FN.serviceOrder, 'id'),
    manualNoteAdded: true,
});

module.exports = exports = factory;

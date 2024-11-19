const { factory } = require('factory-girl');
const ServiceReferenceItemDetail = require('../../models/serviceReferenceItemDetail');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');
require('./serviceReferenceItems');
require('./servicePrices');
require('./serviceMasters');
require('./inventoryItems');
require('./modifiers');

factory.define(FN.serviceReferenceItemDetail, ServiceReferenceItemDetail, {
    serviceReferenceItemId: factory.assoc(FN.serviceReferenceItem, 'id'),
    lineItemTotalCost: factory.chance('integer', { min: 1, max: 100 }),
    lineItemUnitCost: factory.chance('integer', { min: 1, max: 10 }),
});

factory.extend(FN.serviceReferenceItemDetail, FN.serviceReferenceItemDetailForInventoryItem, {
    soldItemId: factory.assoc('inventoryItem', 'id'),
    soldItemType: 'InventoryItem',
    lineItemName: 'Inventory Item',
    lineItemTotalCost: factory.chance('integer', { min: 1, max: 100 }),
    lineItemUnitCost: factory.chance('integer', { min: 1, max: 10 }),
});

factory.extend(FN.serviceReferenceItemDetail, FN.serviceReferenceItemDetailForServicePrice, {
    soldItemId: factory.assoc('servicePrice', 'id'),
    soldItemType: 'ServicePrices',
    lineItemName: 'Service Test',
    lineItemTotalCost: factory.chance('integer', { min: 1, max: 100 }),
    lineItemUnitCost: factory.chance('integer', { min: 1, max: 10 }),
});

factory.extend(FN.serviceReferenceItemDetail, FN.serviceReferenceItemDetailForServiceMaster, {
    soldItemId: factory.assoc('serviceMaster', 'id'),
    soldItemType: 'ServicesMaster',
    lineItemName: 'ServicesMaster Test',
    lineItemTotalCost: factory.chance('integer', { min: 1, max: 100 }),
    lineItemUnitCost: factory.chance('integer', { min: 1, max: 10 }),
});

factory.extend(FN.serviceReferenceItemDetail, FN.serviceReferenceItemDetailForModifier, {
    soldItemId: factory.assoc('modifier', 'id'),
    soldItemType: 'Modifier',
    lineItemName: 'Modifier Name',
    lineItemTotalCost: factory.chance('integer', { min: 1, max: 100 }),
    lineItemUnitCost: factory.chance('integer', { min: 1, max: 10 }),
});

module.exports = exports = factory;

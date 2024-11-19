require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const { hasAssociation, hasTable, belongsToOne, hasMany, hasOne } = require('../../support/objectionTestHelper')
const ServiceReferenceItem = require('../../../models/serviceReferenceItem');
const factory = require('../../factories');

describe('test ServiceReferenceItem model', () => {

    it('should return true if ServiceReferenceItem table exists', async () => {
        const hasTableName = await hasTable(ServiceReferenceItem.tableName)
        expect(hasTableName).to.be.true
    });

    it('ServiceReferenceItem should have servicePrice association', async () => {
        hasAssociation(ServiceReferenceItem, 'servicePrice')
    });

    it('ServiceReferenceItem should have BelongsToOneRelation servicePrice association', async () => {
        belongsToOne(ServiceReferenceItem, 'servicePrice')
    });

    it('ServiceReferenceItem should have service$ association', async () => {
        hasAssociation(ServiceReferenceItem, 'service$')
    });

    it('ServiceReferenceItem should have BelongsToOneRelation service$ association', async () => {
        belongsToOne(ServiceReferenceItem, 'service$')
    });

    it('ServiceReferenceItem should have inventoryItem association', async () => {
        hasAssociation(ServiceReferenceItem, 'inventoryItem')
    });

    it('ServiceReferenceItem should have BelongsToOneRelation inventoryItem association', async () => {
        belongsToOne(ServiceReferenceItem, 'inventoryItem')
    });

    it('ServiceReferenceItem should have weightLog association', async () => {
        hasAssociation(ServiceReferenceItem, 'weightLog')
    });

    it('ServiceReferenceItem should have HasManyRelation weightLog association', async () => {
        hasMany(ServiceReferenceItem, 'weightLog')
    });

    it('ServiceReferenceItem should have serviceOrderBags association', async () => {
        hasAssociation(ServiceReferenceItem, 'serviceOrderBags')
    });

    it('ServiceReferenceItem should have HasManyRelation serviceOrderBags association', async () => {
        hasMany(ServiceReferenceItem, 'serviceOrderBags')
    });

    it('ServiceReferenceItem should have allLineItemDetail association', async () => {
        hasAssociation(ServiceReferenceItem, 'allLineItemDetail')
    });

    it('ServiceReferenceItem should have HasOneRelation allLineItemDetail association', async () => {
        hasOne(ServiceReferenceItem, 'allLineItemDetail')
    });

    it('ServiceReferenceItem should have lineItemDetail association', async () => {
        hasAssociation(ServiceReferenceItem, 'lineItemDetail')
    });

    it('ServiceReferenceItem should have HasOneRelation lineItemDetail association', async () => {
        hasOne(ServiceReferenceItem, 'lineItemDetail')
    });

    it('ServiceReferenceItem should have orderItem association', async () => {
        hasAssociation(ServiceReferenceItem, 'orderItem')
    });

    it('ServiceReferenceItem should have BelongsToOneRelation orderItem association', async () => {
        belongsToOne(ServiceReferenceItem, 'orderItem')
    });

    it('ServiceReferenceItem should have modifiers association', async () => {
        hasAssociation(ServiceReferenceItem, 'modifiers')
    });

    it('ServiceReferenceItem should have HasManyRelation modifiers association', async () => {
        hasMany(ServiceReferenceItem, 'modifiers')
    });

    it('ServiceReferenceItem model should have getLineItem method when created', async () => {
         const serviceReferenceItem = await factory.create('serviceReferenceItem');
         expect(serviceReferenceItem.getLineItem).to.be.a('function');
     });

    it('ServiceReferenceItem model getLineItem method should return lineItemDetail', async () => {
        const inventoryItem = await factory.create('inventoryItem');
        const serviceReferenceItem = await factory.create('serviceReferenceItem', {
                inventoryItemId: inventoryItem.id,
            });
        const serviceReferenceItemDetail = await factory.create('serviceReferenceItemDetail', {
                serviceReferenceItemId: serviceReferenceItem.id,
                soldItemId: inventoryItem.id,
                soldItemType: inventoryItem,
                lineItemName: 'test',
                lineItemTotalCost: 10,
                lineItemUnitCost: 1,
            });
            expect((await serviceReferenceItem.getLineItem()).id).to.be.eq(serviceReferenceItemDetail.id);
    });
});

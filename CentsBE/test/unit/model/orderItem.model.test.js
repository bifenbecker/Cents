require('../../testHelper')
const { expect } = require('../../support/chaiHelper');
const { hasAssociation, hasTable, belongsToOne, hasMany } = require('../../support/objectionTestHelper')
const OrderItem = require('../../../models/serviceOrderItem');

const factory = require('../../factories');

describe('test OrderItem model', () => {

    it('should return true if OrderItem table exists', async () => {
        const hasTableName = await hasTable(OrderItem.tableName)
        expect(hasTableName).to.be.true
    })

    it('OrderItem should have allReferenceItems association', async () => {
        hasAssociation(OrderItem, 'allReferenceItems')
    });

    it('OrderItem should HasManyRelation allReferenceItems association', async () => {
        hasMany(OrderItem, 'allReferenceItems')
    });

    it('OrderItem should have referenceItems association', async () => {
        hasAssociation(OrderItem, 'referenceItems')
    });

    it('OrderItem should HasManyRelation referenceItems association', async () => {
        hasMany(OrderItem, 'referenceItems')
    });

    it('OrderItem should have serviceOrder association', async () => {
        hasAssociation(OrderItem, 'serviceOrder')
    });

    it('OrderItem should BelongsToOneRelation serviceOrder association', async () => {
        belongsToOne(OrderItem, 'serviceOrder')
    });
});

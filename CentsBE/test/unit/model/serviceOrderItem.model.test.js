require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const { hasAssociation, hasTable, belongsToOne, hasMany } = require('../../support/objectionTestHelper')
const ServiceOrderItem = require('../../../models/serviceOrderItem');
const factory = require('../../factories');

describe('test ServiceOrderItem model', () => {

    it('should return true if ServiceOrderItem table exists', async () => {
        const hasTableName = await hasTable(ServiceOrderItem.tableName)
        expect(hasTableName).to.be.true
    });

    it('ServiceOrderItem should have allReferenceItems association', async () => {
        hasAssociation(ServiceOrderItem, 'allReferenceItems')
    });

    it('ServiceOrderItem should have HasManyRelation allReferenceItems association', async () => {
        hasMany(ServiceOrderItem, 'allReferenceItems')
    });

    it('ServiceOrderItem should have referenceItems association', async () => {
        hasAssociation(ServiceOrderItem, 'referenceItems')
    });

    it('ServiceOrderItem should have HasManyRelation referenceItems association', async () => {
        hasMany(ServiceOrderItem, 'referenceItems')
    });

    it('ServiceOrderItem should have serviceOrder association', async () => {
        hasAssociation(ServiceOrderItem, 'serviceOrder')
    });

    it('ServiceOrderItem should have BelongsToOneRelation serviceOrder association', async () => {
        belongsToOne(ServiceOrderItem, 'serviceOrder')
    });

    it('ServiceOrderItem should update deletedAt field if it is deleted when updated for beforeUpdate hook ', async () => {
        const serviceOrderItem = await factory.create('serviceOrderItem');

        const sampleRow = await ServiceOrderItem.query().limit(1);
        const columns = sampleRow.length ? Object.keys(sampleRow[0]) : [];

        const deletedServiceOrderItem = await ServiceOrderItem.query()
            .patch({
                ...(columns.includes('isDeleted') && { isDeleted: true }),
                deletedAt: new Date().toISOString(),
            })
            .findById(serviceOrderItem.id)
            .returning('*');
        expect(deletedServiceOrderItem.deletedAt).to.not.be.null;
        expect(deletedServiceOrderItem.deletedAt).to.not.be.undefined;
    });
})
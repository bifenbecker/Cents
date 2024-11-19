require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const { hasAssociation, hasTable, belongsToOne } = require('../../support/objectionTestHelper')
const ServiceReferenceItemModifiers = require('../../../models/serviceReferenceItemModifiers');
const factory = require('../../factories');

describe('test ServiceReferenceItemModifiers model', () => {

    it('should return true if ServiceReferenceItemModifiers table exists', async () => {
        const hasTableName = await hasTable(ServiceReferenceItemModifiers.tableName)
        expect(hasTableName).to.be.true
    });

    it('ServiceReferenceItemModifiers should have serviceReferenceItem association', async () => {
        hasAssociation(ServiceReferenceItemModifiers, 'serviceReferenceItem')
    });

    it('ServiceReferenceItemModifiers should have BelongsToOneRelation serviceReferenceItem association', async () => {
        belongsToOne(ServiceReferenceItemModifiers, 'serviceReferenceItem')
    });

    it('ServiceReferenceItemModifiers should have updatedAt field when updated for beforeUpdate hook', async () => {
        const serviceReferenceItemModifiers = await factory.create('serviceReferenceItemModifiers');
        const updatedserviceReferenceItemModifiers = await ServiceReferenceItemModifiers.query()
            .patch({
                modifierPrice: 1234,
            })
            .findById(serviceReferenceItemModifiers.id)
            .returning('*');
        expect(updatedserviceReferenceItemModifiers.updatedAt).to.not.be.null;
        expect(updatedserviceReferenceItemModifiers.updatedAt).to.not.be.undefined;
        expect(updatedserviceReferenceItemModifiers.updatedAt).to.be.a.dateString();
    });
})
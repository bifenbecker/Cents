require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation, hasTable, belongsToOne, hasOne } = require('../../support/objectionTestHelper');
const ServiceReferenceItemDetailModifier = require('../../../models/serviceReferenceItemDetailModifier');
const factory = require('../../factories');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');

describe('test ServiceReferenceItemDetailModifier model', () => {

    it('should return true if ServiceReferenceItemDetailModifier table exists', async () => {
        const hasTableName = await hasTable(ServiceReferenceItemDetailModifier.tableName);
        expect(hasTableName).to.be.true
    });

    it('ServiceReferenceItemDetailModifier should have lineItem association', async () => {
        hasAssociation(ServiceReferenceItemDetailModifier, 'lineItem');
    });

    it('ServiceReferenceItemDetailModifier should have BelongsToOneRelation lineItem association', async () => {
        belongsToOne(ServiceReferenceItemDetailModifier, 'lineItem');
    });

    it('ServiceReferenceItemDetailModifier should have modifier association', async () => {
        hasAssociation(ServiceReferenceItemDetailModifier, 'modifier');
    });

    it('ServiceReferenceItemDetailModifier should have hasOne modifier association', async () => {
        hasOne(ServiceReferenceItemDetailModifier, 'modifier');
    });

    it('ServiceReferenceItemDetailModifier should have modifierVersion association', async () => {
        hasAssociation(ServiceReferenceItemDetailModifier, 'modifierVersion');
    });

    it('ServiceReferenceItemDetailModifier should have hasOne modifierVersion association', async () => {
        hasOne(ServiceReferenceItemDetailModifier, 'modifierVersion');
    });

    it('ServiceReferenceItemDetailModifier should have updatedAt field when updated for beforeUpdate hook', async () => {
        const modifierLineItem = await factory.create(FACTORIES_NAMES.serviceReferenceItemDetailModifier);
        const initialModifierLineItem = await ServiceReferenceItemDetailModifier.query()
            .findById(modifierLineItem.id);
        const updatedModifierLineItem = await ServiceReferenceItemDetailModifier.query()
            .patch({
                modifierName: 'new name',
            })
            .findById(initialModifierLineItem.id)
            .returning('*');
        expect(updatedModifierLineItem.updatedAt).to.not.be.null;
        expect(updatedModifierLineItem.updatedAt).to.not.be.undefined;
        expect(updatedModifierLineItem.updatedAt).to.be.a.dateString();
    });
});

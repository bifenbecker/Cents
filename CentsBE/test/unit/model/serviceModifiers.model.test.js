require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation, hasTable, belongsToOne } = require('../../support/objectionTestHelper');
const { beforeUpdateHookTestHelper } = require('../../support/hookTestHelper');
const ServiceModifier = require('../../../models/serviceModifiers');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

describe('test ServiceModifier model', () => {
    it('should return true if serviceModifiers table exists', async () => {
        const hasTableName = await hasTable(ServiceModifier.tableName);
        expect(hasTableName).to.be.true;
    });

    it('ServiceModifier should have modifier association', async () => {
        hasAssociation(ServiceModifier, 'modifier');
    });

    it('ServiceModifier should BelongsToOneRelation modifier association', async () => {
        belongsToOne(ServiceModifier, 'modifier');
    });

    it('ServiceModifier should update updatedAt field when it updated', async () => {
        await beforeUpdateHookTestHelper({
            factoryName: FN.serviceModifier,
            model: ServiceModifier,
            patchPropName: 'isFeatured',
            patchPropValue: true,
        });
    });
});

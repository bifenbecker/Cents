require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation, hasTable, belongsToOne } = require('../../support/objectionTestHelper');
const { beforeUpdateHookTestHelper } = require('../../support/hookTestHelper');
const BusinessOrderCount = require('../../../models/businessOrderCount');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

describe('test BusinessOrderCount model', () => {
    it('should return true if businessOrdersCount table exists', async () => {
        const hasTableName = await hasTable(BusinessOrderCount.tableName);
        expect(hasTableName).to.be.true;
    });

    it('BusinessOrderCount should have business association', async () => {
        hasAssociation(BusinessOrderCount, 'business');
    });

    it('BusinessOrderCount should BelongsToOneRelation business association', async () => {
        belongsToOne(BusinessOrderCount, 'business');
    });

    it('BusinessOrderCount should update updatedAt field when it updated', async () => {
        await beforeUpdateHookTestHelper({
            factoryName: FN.businessOrderCount,
            model: BusinessOrderCount,
            patchPropName: 'totalOrders',
            patchPropValue: 0,
        });
    });
});

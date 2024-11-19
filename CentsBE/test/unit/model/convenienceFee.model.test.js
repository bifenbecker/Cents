require('../../testHelper')
const { expect } = require('../../support/chaiHelper');
const { hasAssociation, hasTable, belongsToOne } = require('../../support/objectionTestHelper')
const ConvenienceFee = require('../../../models/convenienceFee');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');
const { beforeUpdateHookTestHelper } = require('../../support/hookTestHelper');

describe('test ConvenienceFee model', () => {

    it('should return true if ConvenienceFee table exists', async () => {
        const hasTableName = await hasTable(ConvenienceFee.tableName);
        expect(hasTableName).to.be.true;
    })

    it('ConvenienceFee should have business association', async () => {
        hasAssociation(ConvenienceFee, 'business');
    });

    it('ConvenienceFee should BelongsToOneRelation business association', async () => {
        belongsToOne(ConvenienceFee, 'business');
    });

    it('ConvenienceFee should update updatedAt field when it updated', async () => {
        await beforeUpdateHookTestHelper({
            factoryName: FACTORIES_NAMES.convenienceFee,
            model: ConvenienceFee,
            patchPropName: 'fee',
            patchPropValue: 10
        })
    });

});

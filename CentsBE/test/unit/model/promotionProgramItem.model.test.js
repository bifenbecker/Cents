require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const { hasAssociation, hasTable, belongsToOne } = require('../../support/objectionTestHelper')
const PromotionProgramItem = require('../../../models/promotionProgramItem');

describe('test PromotionProgramItem model', () => {

    it('should return true if PromotionProgramItem table exists', async () => {
        const hasTableName = await hasTable(PromotionProgramItem.tableName)
        expect(hasTableName).to.be.true
    })

    it('PromotionProgramItem should have business association', async () => {
        hasAssociation(PromotionProgramItem, 'business')
    });

    it('PromotionProgramItem should BelongsToOneRelation business association', async () => {
        belongsToOne(PromotionProgramItem, 'business')
    });

    it('PromotionProgramItem should have businessPromotionProgram association', async () => {
        hasAssociation(PromotionProgramItem, 'businessPromotionProgram')
    });

    it('PromotionProgramItem should BelongsToOneRelation businessPromotionProgram association', async () => {
        belongsToOne(PromotionProgramItem, 'businessPromotionProgram')
    });

});

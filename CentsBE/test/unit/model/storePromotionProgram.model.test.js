require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const { hasAssociation, hasTable, belongsToOne, hasMany } = require('../../support/objectionTestHelper')
const StorePromotionProgram = require('../../../models/storePromotionProgram');

describe('test StorePromotionProgram model', () => {

    it('should return true if StorePromotionProgram table exists', async () => {
        const hasTableName = await hasTable(StorePromotionProgram.tableName)
        expect(hasTableName).to.be.true
    })

    it('StorePromotionProgram should have business association', async () => {
        hasAssociation(StorePromotionProgram, 'business')
    });

    it('StorePromotionProgram should BelongsToOneRelation business association', async () => {
        belongsToOne(StorePromotionProgram, 'business')
    });

    it('StorePromotionProgram should have store association', async () => {
        hasAssociation(StorePromotionProgram, 'store')
    });

    it('StorePromotionProgram should BelongsToOneRelation store association', async () => {
        belongsToOne(StorePromotionProgram, 'store')
    });

    it('StorePromotionProgram should have businessPromotionProgram association', async () => {
        hasAssociation(StorePromotionProgram, 'businessPromotionProgram')
    });

    it('StorePromotionProgram should BelongsToOneRelation businessPromotionProgram association', async () => {
        belongsToOne(StorePromotionProgram, 'businessPromotionProgram')
    });

});

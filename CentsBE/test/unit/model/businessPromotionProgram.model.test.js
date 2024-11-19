require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasTable,
    hasMany,
    belongsToOne,
    hasAssociation,
} = require('../../support/objectionTestHelper');
const factory = require('../../factories');
const BusinessPromotionProgram = require('../../../models/businessPromotionProgram');

const PROMOTION_ITEM_ID = 1; // test value / should be serviceMaster.id value, created with createServicePayload

describe('test BusinessPromotionProgram model', () => {
    it('should return true if businessPromotionProgram table exists', async () => {
        const hasTableName = await hasTable(BusinessPromotionProgram.tableName);
        expect(hasTableName).to.be.true;
    });

    it('should return true if businessPromotionProgram idColumn exists', async () => {
        const idColumn = await BusinessPromotionProgram.idColumn;
        expect(idColumn).not.to.be.empty;
    });

    it('businessPromotionProgram should have business association', () => {
        hasAssociation(BusinessPromotionProgram, 'business');
    });

    it('businessPromotionProgram should belongs to one relation business association', async () => {
        belongsToOne(BusinessPromotionProgram, 'business');
    });

    it('businessPromotionProgram should have storePromotions association', () => {
        hasAssociation(BusinessPromotionProgram, 'storePromotions');
    });

    it('businessPromotionProgram should have many storePromotions association', async () => {
        hasMany(BusinessPromotionProgram, 'storePromotions');
    });

    it('businessPromotionProgram should have promotionItems association', () => {
        hasAssociation(BusinessPromotionProgram, 'promotionItems');
    });

    it('businessPromotionProgram should have many promotionItems association', async () => {
        hasMany(BusinessPromotionProgram, 'promotionItems');
    });

    it('businessPromotionProgram model should have getBusiness method when created', async () => {
        const promotion = await factory.create('promotion');
        expect(promotion.getBusiness).to.be.a('function');
    });

    it('businessPromotionProgram model getBusiness method should return laundromatBusiness', async () => {
        const laundromatBusiness = await factory.create('laundromatBusiness'),
            promotion = await factory.create('promotion', {
                businessId: laundromatBusiness.id,
            });
        expect((await promotion.getBusiness()).id).to.be.eq(laundromatBusiness.id);
    });

    it('businessPromotionProgram model should have getStorePromotions method when created', async () => {
        const promotion = await factory.create('promotion');
        expect(promotion.getStorePromotions).to.be.a('function');
    });

    it('businessPromotionProgram model getStorePromotions method should return storePromotions', async () => {
        const promotion = await factory.create('promotion');
        const storePromotions = await factory.create('storePromotionProgram', {
            businessPromotionProgramId: promotion.id,
        });
        expect((await promotion.getStorePromotions())[0].id).to.be.eq(storePromotions.id);
    });

    it('businessPromotionProgram model should have getPromotionItems method when created', async () => {
        const promotion = await factory.create('promotion');
        expect(promotion.getPromotionItems).to.be.a('function');
    });

    it('businessPromotionProgram model getPromotionItems method should return promotionItems', async () => {
        const promotion = await factory.create('promotion');
        const promotionItems = await factory.create('promotionProgramItem', {
            businessPromotionProgramId: promotion.id,
            promotionItemId: PROMOTION_ITEM_ID,
            promotionItemType: 'Inventory',
        });
        expect((await promotion.getPromotionItems())[0].id).to.be.eq(promotionItems.id);
    });
});

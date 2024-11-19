require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const getPromotionDetails = require('../../../../../services/orders/queries/getPromotionDetails');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');

describe('getPromotionDetails test', function () {
    let promotion, promotionProgramItem, business;
    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        promotion = await factory.create(FACTORIES_NAMES.promotion);
        const inventory = await factory.create(FACTORIES_NAMES.inventory);
        promotionProgramItem = await factory.create(FACTORIES_NAMES.promotionProgramItem, {
            businessPromotionProgramId: promotion.id,
            businessId: business.id,
            promotionItemId: inventory.id,
            promotionItemType: 'Inventory',
        });
    });

    it('should return expected result', async () => {
        const res = await getPromotionDetails(promotion.id);
        expect(res.name).equal(promotion.name);
        expect(res.promotionType).equal(promotion.promotionType);
        expect(res.currency).equal(promotion.currency);
        expect(res.currency).equal(promotion.currency);
        expect(res.discountValue).equal(promotion.discountValue);
        expect(res.appliesToType).equal(promotion.appliesToType);
        expect(res.locationEligibilityType).equal(promotion.locationEligibilityType);
        expect(res.promotionItems).not.be.empty;
        expect(res.promotionItems[0].businessId).equal(promotionProgramItem.businessId);
        expect(res.promotionItems[0].promotionItemId).equal(promotionProgramItem.promotionItemId);
        expect(res.promotionItems[0].promotionItemType).equal(
            promotionProgramItem.promotionItemType,
        );
    });

    it('should return undefined when wrong id passed', async () => {
        const res = await getPromotionDetails(-1234);
        expect(res).equal(undefined);
    });
});

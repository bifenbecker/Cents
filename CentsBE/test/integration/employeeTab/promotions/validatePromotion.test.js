const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect, assert } = require('../../../support/chaiHelper');
require('../../../testHelper');

const PROMOTION_CODE = 'TEST';
const SERVICE_MASTER_ITEM_TYPE = 'ServicesMaster';
const INVENTORY_ITEM_TYPE = 'Inventory';
const ACTIVE_DAYS_ALL = [
    { day: 'sunday' },
    { day: 'monday' },
    { day: 'tuesday' },
    { day: 'wednesday' },
    { day: 'thursday' },
    { day: 'friday' },
    { day: 'saturday' },
];

async function getToken(storeId) {
    return generateToken({ id: storeId });
}

describe('test /api/v1/employee-tab/promotions/validate', () => {
    const apiEndPoint = '/api/v1/employee-tab/promotions/validate';

    let store, token;

    beforeEach(async () => {
        const business = await factory.create('laundromatBusiness');
        store = await factory.create('store', { businessId: business.id });
        token = await getToken(store.id);
    });

    it('should throw an error if token is not sent', async () => {
        const res = await ChaiHttpRequestHelper.post(apiEndPoint).set('authtoken', '');
        res.should.have.status(401);
    });

    it('should throw an error if promotionCode is absent', async () => {
        const body = { storeId: store.id };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

        res.should.have.status(422);
        expect(res.body.error).to.equal('Promotion Code is required.');
    });

    it('should throw an error if promotion does not exist', async () => {
        const body = { storeId: store.id, promotionCode: PROMOTION_CODE };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

        res.should.have.status(404);
        expect(res.body.error).to.equal('The promotion code is invalid or does not exist');
    });

    it('should create centsCustomerId by storeCustomer id if centsCustomerId in customer is absent', async () => {
        const promotion = await factory.create('promotion', {
            businessId: store.businessId,
            name: PROMOTION_CODE,
            active: true,
            customerRedemptionLimit: 0,
            requirementType: 'none',
            appliesToType: 'entire-order',
            activeDays: JSON.stringify(ACTIVE_DAYS_ALL),
        });

        const inventoryCategory = await factory.create('inventoryCategory', {
            businessId: store.businessId,
        });

        const inventory = await factory.create('inventory', {
            categoryId: inventoryCategory.id,
        });

        await factory.create('inventoryItem', {
            inventoryId: inventory.id,
        });

        await factory.create('promotionProgramItem', {
            businessPromotionProgramId: promotion.id,
            promotionItemId: inventory.id,
            promotionItemType: 'Inventory',
        });

        await factory.create('storePromotionProgram', {
            businessPromotionProgramId: promotion.id,
        });

        const storeCustomer = await factory.create('storeCustomer', {
            storeId: store.id,
            businessId: store.businessId,
        });

        const body = {
            storeId: store.id,
            promotionCode: PROMOTION_CODE,
            customer: { id: storeCustomer.id },
            orderItems: [],
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.success).to.equal(true);
    });

    it('should return a 200 and proper data when payload data is correct', async () => {
        const centsCustomer = await factory.create('centsCustomer');
        const promotion = await factory.create('promotion', {
            businessId: store.businessId,
            name: PROMOTION_CODE,
            active: true,
            customerRedemptionLimit: 0,
            requirementType: '',
            appliesToType: 'entire-order',
            activeDays: JSON.stringify(ACTIVE_DAYS_ALL),
        });

        const serviceCategory = await factory.create('serviceCategory', {
            businessId: store.businessId,
        });

        const service = await factory.create('serviceMaster', {
            serviceCategoryId: serviceCategory.id,
        });

        const servicePrice = await factory.create('servicePrice', {
            serviceId: service.id,
        });

        await factory.create('promotionProgramItem', {
            businessPromotionProgramId: promotion.id,
            promotionItemId: servicePrice.id,
            promotionItemType: 'Inventory',
        });

        await factory.create('storePromotionProgram', {
            businessPromotionProgramId: promotion.id,
        });

        const body = {
            storeId: store.id,
            promotionCode: PROMOTION_CODE,
            customer: { centsCustomerId: centsCustomer.id },
            orderItems: [],
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.success).to.equal(true);
        expect(res.body.promotionProgram[0].activeDays).to.eql(ACTIVE_DAYS_ALL);
    });

    it('should return a 200 and proper data when payload data is correct and lineItemType equals to service', async () => {
        const centsCustomer = await factory.create('centsCustomer');
        const promotion = await factory.create('promotion', {
            businessId: store.businessId,
            name: PROMOTION_CODE,
            active: true,
            customerRedemptionLimit: 1,
            requirementType: 'min-quantity',
            appliesToType: 'entire-order',
            activeDays: JSON.stringify(ACTIVE_DAYS_ALL),
        });

        const serviceCategory = await factory.create('serviceCategory', {
            businessId: store.businessId,
        });

        const service = await factory.create('serviceMaster', {
            serviceCategoryId: serviceCategory.id,
        });

        const servicePrice = await factory.create('servicePrice', {
            serviceId: service.id,
        });

        await factory.create('promotionProgramItem', {
            businessPromotionProgramId: promotion.id,
            promotionItemId: service.id,
            promotionItemType: SERVICE_MASTER_ITEM_TYPE,
        });

        await factory.create('storePromotionProgram', {
            businessPromotionProgramId: promotion.id,
        });

        const testOrderItem = {
            priceId: servicePrice.id,
            lineItemType: 'SERVICE',
            count: 1,
        };

        const body = {
            storeId: store.id,
            promotionCode: PROMOTION_CODE,
            customer: { centsCustomerId: centsCustomer.id },
            orderItems: [testOrderItem],
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.success).to.equal(true);
        expect(res.body.applicableItems[0]).to.eql(testOrderItem);
    });

    it('should return a 200 and proper data when payload data is correct and lineItemType equals to inventory', async () => {
        const centsCustomer = await factory.create('centsCustomer');
        const promotion = await factory.create('promotion', {
            businessId: store.businessId,
            name: PROMOTION_CODE,
            active: true,
            customerRedemptionLimit: 1,
            requirementType: 'min-purchase-amount',
            appliesToType: 'entire-order',
            activeDays: JSON.stringify(ACTIVE_DAYS_ALL),
        });

        const inventoryCategory = await factory.create('inventoryCategory', {
            businessId: store.businessId,
        });

        const inventory = await factory.create('inventory', {
            categoryId: inventoryCategory.id,
        });

        const inventoryItem = await factory.create('inventoryItem', {
            inventoryId: inventory.id,
        });

        await factory.create('promotionProgramItem', {
            businessId: store.businessId,
            businessPromotionProgramId: promotion.id,
            promotionItemId: inventory.id,
            promotionItemType: INVENTORY_ITEM_TYPE,
        });

        await factory.create('storePromotionProgram', {
            storeId: store.id,
            businessId: store.businessId,
            businessPromotionProgramId: promotion.id,
        });

        const testOrderItem = {
            priceId: inventoryItem.id,
            lineItemType: 'INVENTORY',
            count: 1,
        };

        const body = {
            storeId: store.id,
            promotionCode: PROMOTION_CODE,
            customer: { centsCustomerId: centsCustomer.id },
            orderItems: [testOrderItem],
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.success).to.equal(true);
        expect(res.body.applicableItems[0]).to.eql(testOrderItem);
    });

    it('should return a 200 and proper data when payload data is correct with specific-items applies to type', async () => {
        const centsCustomer = await factory.create('centsCustomer');
        const promotion = await factory.create('promotion', {
            businessId: store.businessId,
            name: PROMOTION_CODE,
            active: true,
            customerRedemptionLimit: 1,
            requirementType: 'min-purchase-amount',
            appliesToType: 'specific-items',
            activeDays: JSON.stringify(ACTIVE_DAYS_ALL),
        });

        const inventoryCategory = await factory.create('inventoryCategory', {
            businessId: store.businessId,
        });

        const inventory = await factory.create('inventory', {
            categoryId: inventoryCategory.id,
        });

        const inventoryItem = await factory.create('inventoryItem', {
            inventoryId: inventory.id,
        });

        await factory.create('promotionProgramItem', {
            businessPromotionProgramId: promotion.id,
            promotionItemId: inventory.id,
            promotionItemType: INVENTORY_ITEM_TYPE,
        });

        await factory.create('storePromotionProgram', {
            businessPromotionProgramId: promotion.id,
        });

        const testOrderItem = {
            priceId: inventoryItem.id,
            lineItemType: 'INVENTORY',
            count: 1,
        };

        const body = {
            storeId: store.id,
            promotionCode: PROMOTION_CODE,
            customer: { centsCustomerId: centsCustomer.id },
            orderItems: [testOrderItem],
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.success).to.equal(true);
        expect(res.body.applicableItems[0]).to.eql(testOrderItem);
    });
});

require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const PROMOTION_CODE = 'TEST';
const LOWERCASE_PROMOTION_CODE = 'test';
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

describe('test /api/v1/employee-tab/promotions/validate validations', () => {
    const apiEndPoint = '/api/v1/employee-tab/promotions/validate';

    let store, token;
    describe('test unhappy paths', () => {
        beforeEach(async () => {
            const business = await factory.create('laundromatBusiness');
            store = await factory.create('store', { businessId: business.id });
            token = await getToken(store.id);
        });

        it('should throw an error if orderItems is absent', async () => {
            const centsCustomer = await factory.create('centsCustomer');
            const promotion = await factory.create('promotion', {
                businessId: store.businessId,
                name: PROMOTION_CODE,
                active: true,
                customerRedemptionLimit: 0,
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
                businessPromotionProgramId: promotion.id,
                promotionItemId: inventoryItem.id,
                promotionItemType: 'Inventory',
            });

            await factory.create('storePromotionProgram', {
                businessPromotionProgramId: promotion.id,
            });

            const body = {
                storeId: store.id,
                promotionCode: PROMOTION_CODE,
                customer: { centsCustomerId: centsCustomer.id },
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

            res.should.have.status(500);
            expect(res.body.error).to.equal('orderItems is not iterable');
        });

        // validateProductsAndServices
        it('should throw an error if product or service is absent', async () => {
            const centsCustomer = await factory.create('centsCustomer');
            const promotion = await factory.create('promotion', {
                businessId: store.businessId,
                name: PROMOTION_CODE,
                active: true,
                customerRedemptionLimit: 0,
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
                promotionItemId: inventoryItem.id,
                promotionItemType: 'Inventory',
            });

            await factory.create('storePromotionProgram', {
                businessPromotionProgramId: promotion.id,
            });

            const body = {
                storeId: store.id,
                promotionCode: PROMOTION_CODE,
                customer: { centsCustomerId: centsCustomer.id },
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

            res.should.have.status(422);
            expect(res.body.error).to.equal(
                'The promotion requires a product or service that is not included in this order.',
            );
        });

        // validateActiveDays
        it('should throw an error if promotion day of week does not match the allowed', async () => {
            const centsCustomer = await factory.create('centsCustomer');
            const promotion = await factory.create('promotion', {
                businessId: store.businessId,
                name: PROMOTION_CODE,
                active: true,
                activeDays: JSON.stringify([]),
                customerRedemptionLimit: 0,
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
                promotionItemId: inventoryItem.id,
                promotionItemType: 'Inventory',
            });

            await factory.create('storePromotionProgram', {
                businessPromotionProgramId: promotion.id,
            });

            const body = {
                storeId: store.id,
                promotionCode: PROMOTION_CODE,
                customer: { centsCustomerId: centsCustomer.id },
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

            res.should.have.status(422);
            expect(res.body.error).to.equal(
                'This promotion is not active for the current day of the week.',
            );
        });

        // redemptionLimitValidation
        it('should throw an error if promotion is already redeemed by customer', async () => {
            const centsCustomer = await factory.create('centsCustomer');
            const storeCustomer = await factory.create('storeCustomer', {
                storeId: store.id,
                businessId: store.businessId,
                centsCustomerId: centsCustomer.id,
            });
            const promotion = await factory.create('promotion', {
                businessId: store.businessId,
                name: PROMOTION_CODE,
                active: true,
                customerRedemptionLimit: 1,
            });

            await factory.create('serviceOrder', {
                storeCustomerId: storeCustomer.id,
                promotionId: promotion.id,
            });

            const body = {
                storeId: store.id,
                promotionCode: PROMOTION_CODE,
                customer: { centsCustomerId: centsCustomer.id },
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

            res.should.have.status(422);
            expect(res.body.error).to.equal('This customer has already redeemed this promotion.');
        });

        // performValidations
        it('should throw an error if promotion program is not active', async () => {
            const promotion = await factory.create('promotion', {
                businessId: store.businessId,
                name: PROMOTION_CODE,
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
                promotionItemId: inventoryItem.id,
                promotionItemType: 'Inventory',
            });

            await factory.create('storePromotionProgram', {
                businessPromotionProgramId: promotion.id,
            });

            const body = {
                storeId: store.id,
                promotionCode: PROMOTION_CODE,
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

            res.should.have.status(422);
            expect(res.body.error).to.equal('This promotion is no longer active.');
        });

        // performValidations
        it('should throw an error if customer in body is absent', async () => {
            const promotion = await factory.create('promotion', {
                businessId: store.businessId,
                name: PROMOTION_CODE,
                active: true,
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
                promotionItemId: inventoryItem.id,
                promotionItemType: 'Inventory',
            });

            await factory.create('storePromotionProgram', {
                businessPromotionProgramId: promotion.id,
            });

            const body = {
                storeId: store.id,
                promotionCode: PROMOTION_CODE,
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

            res.should.have.status(500);
            expect(res.body.error).to.equal(`Cannot read property 'centsCustomerId' of undefined`);
        });

        // performValidations
        it('should throw an error if centsCustomerId in customer is absent', async () => {
            const promotion = await factory.create('promotion', {
                businessId: store.businessId,
                name: PROMOTION_CODE,
                active: true,
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
                promotionItemId: inventoryItem.id,
                promotionItemType: 'Inventory',
            });

            await factory.create('storePromotionProgram', {
                businessPromotionProgramId: promotion.id,
            });

            const body = {
                storeId: store.id,
                promotionCode: PROMOTION_CODE,
                customer: {},
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

            res.should.have.status(500);
            expect(res.body.error).to.equal('undefined was passed to findById');
        });

        // validateEndDate
        it('should throw an error if the promotion has expired', async () => {
            const centsCustomer = await factory.create('centsCustomer');
            const promotion = await factory.create(
                'promotion',
                {
                    businessId: store.businessId,
                    name: PROMOTION_CODE,
                    active: true,
                    customerRedemptionLimit: 1,
                },
                { withExpiredDate: true },
            );

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
                promotionItemId: inventoryItem.id,
                promotionItemType: 'Inventory',
            });

            await factory.create('storePromotionProgram', {
                businessPromotionProgramId: promotion.id,
            });

            const body = {
                storeId: store.id,
                promotionCode: PROMOTION_CODE,
                customer: { centsCustomerId: centsCustomer.id },
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

            res.should.have.status(422);
            expect(res.body.error).to.equal('This promotion has expired.');
        });

        // validateStartDate
        it('should throw an error if startDate starts before validateStartDate', async () => {
            const centsCustomer = await factory.create('centsCustomer');
            const promotion = await factory.create(
                'promotion',
                {
                    businessId: store.businessId,
                    name: PROMOTION_CODE,
                    active: true,
                    customerRedemptionLimit: 1,
                },
                { withBeforeStartDate: true },
            );

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
                promotionItemId: inventoryItem.id,
                promotionItemType: 'Inventory',
            });

            await factory.create('storePromotionProgram', {
                businessPromotionProgramId: promotion.id,
            });

            const body = {
                storeId: store.id,
                promotionCode: PROMOTION_CODE,
                customer: { centsCustomerId: centsCustomer.id },
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

            res.should.have.status(422);
            expect(res.body.error).to.equal('This promotion has not started yet.');
        });

        // validateLocation
        it('should throw an error if location is not valid', async () => {
            const centsCustomer = await factory.create('centsCustomer');
            const promotion = await factory.create('promotion', {
                businessId: store.businessId,
                name: PROMOTION_CODE,
                active: true,
                customerRedemptionLimit: 1,
                locationEligibilityType: 'specific-locations',
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
                promotionItemId: inventoryItem.id,
                promotionItemType: 'Inventory',
            });

            await factory.create('storePromotionProgram', {
                businessPromotionProgramId: promotion.id,
            });

            const body = {
                storeId: store.id,
                promotionCode: PROMOTION_CODE,
                customer: { centsCustomerId: centsCustomer.id },
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

            res.should.have.status(422);
            expect(res.body.error).to.equal('This promotion is not valid at this store.');
        });

        // validateMinRequirements >> determineMinQuantityValidation
        it('should throw an error if the total quantity of order items is equal to 0', async () => {
            const centsCustomer = await factory.create('centsCustomer');
            const promotion = await factory.create('promotion', {
                businessId: store.businessId,
                name: PROMOTION_CODE,
                active: true,
                customerRedemptionLimit: 1,
                requirementType: 'min-quantity',
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
                promotionItemType: SERVICE_MASTER_ITEM_TYPE,
            });

            await factory.create('storePromotionProgram', {
                businessPromotionProgramId: promotion.id,
            });

            const body = {
                storeId: store.id,
                promotionCode: PROMOTION_CODE,
                customer: { centsCustomerId: centsCustomer.id },
                orderItems: [
                    {
                        priceId: servicePrice.id,
                        lineItemType: 'SERVICE',
                        count: 1,
                    },
                ],
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

            res.should.have.status(422);
            expect(res.body.error).to.equal(
                'The promotion requires a minimum total or minimum quantity of order items.',
            );
        });

        // validateMinRequirements >> determineMinQuantityValidation >> calculateOrderItemsQuantity
        it('should throw an error if promotion items does not exist (min quantity)', async () => {
            const centsCustomer = await factory.create('centsCustomer');
            const promotion = await factory.create('promotion', {
                businessId: store.businessId,
                name: PROMOTION_CODE,
                active: true,
                customerRedemptionLimit: 1,
                requirementType: 'min-quantity',
                appliesToType: 'specific-items',
                activeDays: JSON.stringify(ACTIVE_DAYS_ALL),
                requirementValue: 3,
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

            res.should.have.status(422);
            expect(res.body.error).to.equal(
                'The promotion requires a minimum total or minimum quantity of order items.',
            );
        });

        // validateMinRequirements >> determineMinQuantityValidation >> calculateOrderItemsQuantity
        it('should throw an error if the requirement value is greater than the provided value (min quantity)', async () => {
            const centsCustomer = await factory.create('centsCustomer');
            const promotion = await factory.create('promotion', {
                businessId: store.businessId,
                name: PROMOTION_CODE,
                active: true,
                customerRedemptionLimit: 1,
                requirementType: 'min-quantity',
                activeDays: JSON.stringify(ACTIVE_DAYS_ALL),
                requirementValue: 3,
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
                promotionItemId: inventoryItem.id,
                promotionItemType: INVENTORY_ITEM_TYPE,
            });

            await factory.create('storePromotionProgram', {
                businessPromotionProgramId: promotion.id,
            });

            const body = {
                storeId: store.id,
                promotionCode: PROMOTION_CODE,
                customer: { centsCustomerId: centsCustomer.id },
                orderItems: [
                    {
                        priceId: inventoryItem.id,
                        lineItemType: 'INVENTORY',
                        count: 1,
                    },
                ],
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

            res.should.have.status(422);
            expect(res.body.error).to.equal(
                'The promotion requires a minimum total or minimum quantity of order items.',
            );
        });

        // validateMinRequirements >> determineMinTotalValidation
        it('should throw an error if the requirement value is greater than the provided value (min total)', async () => {
            const centsCustomer = await factory.create('centsCustomer');
            const promotion = await factory.create('promotion', {
                businessId: store.businessId,
                name: PROMOTION_CODE,
                active: true,
                customerRedemptionLimit: 1,
                requirementType: 'min-purchase-amount',
                activeDays: JSON.stringify(ACTIVE_DAYS_ALL),
                requirementValue: 2,
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
                promotionItemType: SERVICE_MASTER_ITEM_TYPE,
            });

            await factory.create('storePromotionProgram', {
                businessPromotionProgramId: promotion.id,
            });

            const body = {
                storeId: store.id,
                promotionCode: PROMOTION_CODE,
                customer: { centsCustomerId: centsCustomer.id },
                orderItems: [
                    {
                        priceId: servicePrice.id,
                        lineItemType: 'SERVICE',
                        count: 1,
                    },
                ],
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

            res.should.have.status(422);
            expect(res.body.error).to.equal(
                'The promotion requires a minimum total or minimum quantity of order items.',
            );
        });
    })

    describe('test happy paths', () => {
        beforeEach(async () => {
            const business = await factory.create('laundromatBusiness');
            store = await factory.create('store', { businessId: business.id });
            token = await getToken(store.id);
        });

        // validate uppercase promo code happy path
        it('should return a 200 along with the promo code object', async () => {
            const centsCustomer = await factory.create('centsCustomer');
            const promotion = await factory.create('promotion', {
                businessId: store.businessId,
                name: PROMOTION_CODE,
                active: true,
                appliesToType: 'entire-order',
                activeDays: JSON.stringify(ACTIVE_DAYS_ALL),
                customerRedemptionLimit: 100,
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
                promotionItemId: inventoryItem.id,
                promotionItemType: 'Inventory',
            });

            await factory.create('storePromotionProgram', {
                businessPromotionProgramId: promotion.id,
            });

            const body = {
                storeId: store.id,
                promotionCode: PROMOTION_CODE,
                customer: { centsCustomerId: centsCustomer.id },
                orderItems: [
                    {
                        priceId: inventoryItem.id,
                        lineItemType: 'INVENTORY',
                        count: 1,
                    },
                ],
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

            res.should.have.status(200);
            expect(res.body.success).to.be.true;
            expect(res.body).to.have.a.property('promotionProgram');
            expect(res.body.promotionProgram).to.be.an('array').that.is.not.empty;
            expect(res.body.promotionProgram[0].discountValue).to.equal(promotion.discountValue);
            expect(res.body.promotionProgram[0].name).to.equal(PROMOTION_CODE);
        });

        // validate lowercase promo code happy path
        it('should return a 200 along with the lowercase promo code object', async () => {
            const centsCustomer = await factory.create('centsCustomer');
            const promotion = await factory.create('promotion', {
                businessId: store.businessId,
                name: LOWERCASE_PROMOTION_CODE,
                active: true,
                appliesToType: 'entire-order',
                activeDays: JSON.stringify(ACTIVE_DAYS_ALL),
                customerRedemptionLimit: 100,
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
                promotionItemId: inventoryItem.id,
                promotionItemType: 'Inventory',
            });

            await factory.create('storePromotionProgram', {
                businessPromotionProgramId: promotion.id,
            });

            const body = {
                storeId: store.id,
                promotionCode: PROMOTION_CODE,
                customer: { centsCustomerId: centsCustomer.id },
                orderItems: [
                    {
                        priceId: inventoryItem.id,
                        lineItemType: 'INVENTORY',
                        count: 1,
                    },
                ],
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

            res.should.have.status(200);
            expect(res.body.success).to.be.true;
            expect(res.body).to.have.a.property('promotionProgram');
            expect(res.body.promotionProgram).to.be.an('array').that.is.not.empty;
            expect(res.body.promotionProgram[0].discountValue).to.equal(promotion.discountValue);
            expect(res.body.promotionProgram[0].name).to.equal(LOWERCASE_PROMOTION_CODE);
        });
    })
});

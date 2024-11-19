require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const buildReferenceItemsPayload = require('../../../../../uow/order/serviceOrder/buildReferenceItemsPayload');

const payloadSample = { 
    totalWeight: 100,
    chargeableWeight: 50,
    serviceOrderItems: [],
};

describe('test buildReferenceItemsPayload UOW', () => {
    let business, store, centsCustomer, inventoryOrderItem, inventoryItem;
    beforeEach(async () => {
        centsCustomer = await factory.create(FN.centsCustomer);
        business = await factory.create(FN.laundromatBusiness);
        store = await factory.create(FN.store, {
            businessId: business.id,
        });
        inventoryOrderItem = await factory.create(FN.serviceOrderItemsWithReferenceItem);
        inventoryItem = await factory.create(FN.inventoryItem);
    });

    it('should fail when payload is empty', async () => {
        await expect(buildReferenceItemsPayload({})).to.be.rejected;
    });

    it(`should fail when orderItem doesn't have priceId`, async () => {
        await expect(buildReferenceItemsPayload({
            ...payloadSample,
            customer: centsCustomer,
            serviceOrderItems: [inventoryOrderItem],
        })).to.be.rejected;
    });

    it('should build payload when serviceOrderItems is empty', async () => {
        const result = await buildReferenceItemsPayload({
            ...payloadSample,
            customer: centsCustomer,
        });

        expect(result.totalWeight).to.equal(payloadSample.totalWeight);
        expect(result.chargeableWeight).to.equal(payloadSample.chargeableWeight);
        expect(result.serviceOrderItems).to.be.empty;
        expect(result.customer.id).to.equal(centsCustomer.id);
    });

    it('should build payload', async () => {
        inventoryOrderItem.priceId = inventoryItem.id;
        inventoryOrderItem.id = null;
        const result = await buildReferenceItemsPayload({
            ...payloadSample,
            customer: centsCustomer,
            serviceOrderItems: [inventoryOrderItem],
        });

        expect(result.totalWeight).to.equal(payloadSample.totalWeight);
        expect(result.chargeableWeight).to.equal(payloadSample.chargeableWeight);
        expect(result.serviceOrderItems.length).to.equal(1);
        expect(result.serviceOrderItems[0].priceId).to.equal(inventoryItem.id);
        expect(result.customer.id).to.equal(centsCustomer.id);
    });

    it('should build payload when lineItemType is "SERVICE"', async () => {
        const servicePrice = await factory.create(FN.servicePrice, {
            storeId: store.id,
        });
        inventoryOrderItem.priceId = servicePrice.id;
        inventoryOrderItem.lineItemType = 'SERVICE';
        const result = await buildReferenceItemsPayload({
            ...payloadSample,
            customer: centsCustomer,
            serviceOrderItems: [inventoryOrderItem],
        });

        expect(result.totalWeight).to.equal(payloadSample.totalWeight);
        expect(result.chargeableWeight).to.equal(payloadSample.chargeableWeight);
        expect(result.serviceOrderItems.length).to.equal(1);
        expect(result.serviceOrderItems[0].priceId).to.equal(servicePrice.id);
        expect(result.customer.id).to.equal(centsCustomer.id);
    });

    it('should build payload when lineItemType is "MODIFIER"', async () => {
        inventoryOrderItem.lineItemType = 'MODIFIER';
        const result = await buildReferenceItemsPayload({
            ...payloadSample,
            customer: centsCustomer,
            serviceOrderItems: [inventoryOrderItem],
        });

        expect(result.serviceOrderItems.length).to.equal(1);
        expect(result.serviceOrderItems[0].id).to.equal(inventoryOrderItem.id);
        expect(result.totalWeight).to.equal(payloadSample.totalWeight);
        expect(result.chargeableWeight).to.equal(payloadSample.chargeableWeight);
        expect(result.customer.id).to.equal(centsCustomer.id);
        expect(result.serviceOrderItems[0].referenceItems[0]).to.haveOwnProperty('serviceModifierId');
        expect(result.serviceOrderItems[0].referenceItems[0]).to.haveOwnProperty('quantity');
        expect(result.serviceOrderItems[0].referenceItems[0]).to.haveOwnProperty('unitCost');
        expect(result.serviceOrderItems[0].referenceItems[0]).to.haveOwnProperty('totalPrice');
        expect(result.serviceOrderItems[0].referenceItems[0]).to.haveOwnProperty('lineItemDetail');
    });

    it('should build payload when lineItemType is "SERVICE" but has modifiers', async () => {
        const modifier = await factory.create(FN.modifier, {
            businessId: business.id,
        });
        const serviceCategory = await factory.create(FN.serviceCategory, {
            businessId: business.id,
        });
        const service = await factory.create(FN.serviceMaster, {
            serviceCategoryId: serviceCategory.id,
        });
        const servicePrice = await factory.create(FN.servicePrice, {
            storeId: store.id,
            serviceId: service.id,
        });
        await factory.create(FN.serviceModifier, {
            serviceId: service.id,
            modifierId: modifier.id,
        });
        let serviceReferenceItem = await factory.create(FN.serviceOrderItemsWithReferenceItem);
        const serviceReferenceItemPayload = {
            ...serviceReferenceItem,
            modifiers: [
                {
                    modifierId: modifier.id,
                    name: modifier.name,
                    price: modifier.price,
                    weight: 12,
                    modifierPricingType: modifier.pricingType,
                },
            ],
            lineItemType: 'SERVICE',
            priceId: servicePrice.id,
            weight: 12,
            hasMinPrice: service.hasMinPrice,
            count: 12,
        };
        const result = await buildReferenceItemsPayload({
            ...payloadSample,
            customer: centsCustomer,
            serviceOrderItems: [serviceReferenceItemPayload],
        });

        expect(result.serviceOrderItems.length).to.equal(1);
        expect(result.serviceOrderItems[0].id).to.equal(serviceReferenceItem.id);
        expect(result.customer.id).to.equal(centsCustomer.id);
        expect(result.serviceOrderItems[0].referenceItems[0]).to.haveOwnProperty('quantity');
        expect(result.serviceOrderItems[0].referenceItems[0]).to.haveOwnProperty('unitCost');
        expect(result.serviceOrderItems[0].referenceItems[0]).to.haveOwnProperty('totalPrice');
        expect(result.serviceOrderItems[0].referenceItems[0]).to.haveOwnProperty('lineItemDetail');
        expect(result.serviceOrderItems[0].referenceItems[0].lineItemDetail).to.haveOwnProperty('modifierLineItems');
        expect(result.serviceOrderItems[0].referenceItems[0].lineItemDetail.modifierLineItems.length).to.equal(1);
        expect(result.serviceOrderItems[0].referenceItems[0].lineItemDetail.modifierLineItems[0].modifierId).to.equal(modifier.id);
        expect(result.serviceOrderItems[0].referenceItems[0].lineItemDetail.modifierLineItems[0].modifierName).to.equal(modifier.name);
        expect(result.serviceOrderItems[0].referenceItems[0].lineItemDetail.modifierLineItems[0].unitCost).to.equal(modifier.price);
        expect(result.serviceOrderItems[0].referenceItems[0].lineItemDetail.modifierLineItems[0].quantity).to.equal(12);
        expect(result.serviceOrderItems[0].referenceItems[0].lineItemDetail.modifierLineItems[0].totalCost).to.equal(Number(modifier.price * 12));
    });

    it('should build payload when lineItemType is "MODIFIER" and orderItem.id is null', async () => {
        inventoryOrderItem.lineItemType = 'MODIFIER';
        inventoryOrderItem.id = null;
        const result = await buildReferenceItemsPayload({
            ...payloadSample,
            customer: centsCustomer,
            serviceOrderItems: [inventoryOrderItem],
        });

        expect(result.totalWeight).to.equal(payloadSample.totalWeight);
        expect(result.chargeableWeight).to.equal(payloadSample.chargeableWeight);
        expect(result.serviceOrderItems.length).to.equal(1);
        expect(result.serviceOrderItems[0].id).to.be.null;
        expect(result.customer.id).to.equal(centsCustomer.id);
    });
});

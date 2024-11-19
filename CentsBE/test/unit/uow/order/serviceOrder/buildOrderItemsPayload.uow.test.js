require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { createServicePayload } = require('../../../../support/serviceOrderTestHelper');
const buildOrderItemsPayload = require('../../../../../uow/order/serviceOrder/buildOrderItemsPayload');
const ModifierVersion = require('../../../../../models/modifierVersions');
const ServiceModifier = require('../../../../../models/serviceModifiers');
const ServicePricingStructure = require('../../../../../models/servicePricingStructure');
const { pricingStructureTypes } = require('../../../../../constants/constants');

describe('test buildOrderItemsPayload UOW test', () => {
    let store, status;
    let fixedPriceServicePayload, perPoundServicePayload;
    let orderItems, customer;
    let payload;

    beforeEach(async () => {
        store = await factory.create('store');
        status = 'READY_FOR_PROCESSING';
        fixedPriceServicePayload = await createServicePayload(store);
        perPoundServicePayload = await createServicePayload(store, 'PER_POUND');
        const centsCustomer = await factory.create('centsCustomer');
        const storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });
        customer = {
            storeCustomerId: storeCustomer.id,
            fullName: centsCustomer.firstName + ' ' + centsCustomer.lastName,
            phoneNumber: centsCustomer.phoneNumber,
            notes: 'customer notes',
        };
        const serviceMaster = fixedPriceServicePayload.serviceMaster;
        const servicePricingStructure = await ServicePricingStructure.query().findById(
            serviceMaster.servicePricingStructureId,
        );
        orderItems = [
            {
                priceId: fixedPriceServicePayload.servicePrice.id,
                count: 1,
                weight: 1,
                serviceModifierIds: [],
                lineItemType: 'SERVICE',
                category: 'FIXED_PRICE',
                hasMinPrice: true,
                perItemPrice: 10,
                pricingType: servicePricingStructure.type,
            },
        ];

        payload = {
            orderItems,
            store,
            customer,
            totalWeight: 1,
        };
    });

    it('should return the formatted orderItems payload without modifiers', async () => {
        const result = await buildOrderItemsPayload(payload);
        expect(result).to.have.property('serviceOrderItems').to.be.an('array');
        expect(result.serviceOrderItems).to.have.lengthOf(orderItems.length);
    });

    it('should set the priceId in the return payload', async () => {
        const result = await buildOrderItemsPayload(payload);
        expect(result).to.have.property('serviceOrderItems').to.be.an('array');
        expect(result.serviceOrderItems[0])
            .to.have.property('priceId')
            .equal(fixedPriceServicePayload.servicePrice.id);
    });

    it('should return the formatted orderItems along with the modifiers', async () => {
        // arrange
        payload.orderItems[0].category = 'PER_POUND';
        payload.orderItems[0].priceId = perPoundServicePayload.servicePrice.id;
        payload.orderItems[0].serviceModifierIds = [perPoundServicePayload.serviceModifier.id];
        payload.orderItems[0].pricingType = pricingStructureTypes.PER_POUND;
        payload.orderItems[0].weight = 12;

        // act
        const result = await buildOrderItemsPayload(payload);

        // assert
        expect(result.serviceOrderItems).to.have.lengthOf(orderItems.length + 1);

        const { modifiers } = result.serviceOrderItems[0];
        expect(modifiers).to.not.be.undefined;
        expect(modifiers).to.have.lengthOf(1);

        const modifier = modifiers[0];
        expect(modifier.modifierId).to.equal(perPoundServicePayload.modifier.id);
        expect(modifier.serviceId).to.equal(perPoundServicePayload.serviceModifier.serviceId);
        expect(modifier.modifierPricingType).to.equal(perPoundServicePayload.modifier.pricingType);
        expect(modifier.count).to.equal(orderItems[0].weight);
        expect(modifier.weight).to.equal(orderItems[0].weight);
        expect(modifier).to.have.property('modifierVersionId');

        // get newly created modifierVersion
        const modifierVersionId = modifier.modifierVersionId;
        const modifierVersion = await ModifierVersion.query().findById(modifierVersionId);

        // get original modifier
        const serviceModifier = await ServiceModifier.query()
            .findById(perPoundServicePayload.serviceModifier.id)
            .withGraphJoined('modifier');
        const origModifier = serviceModifier.modifier;

        // ensure newly created modifierVersion has the same values as the original modifier
        expect(modifierVersion).to.not.be.undefined;
        expect(modifierVersion).to.have.property('modifierId').equal(origModifier.id);
        expect(modifierVersion).to.have.property('name').equal(origModifier.name);
        expect(modifierVersion).to.have.property('price').equal(origModifier.price);
        expect(modifierVersion).to.have.property('pricingType').equal(origModifier.pricingType);

        // ensure the modifier entry has the correct latestModifierVersion
        expect(origModifier.latestModifierVersion).to.be.equal(modifierVersion.id);

        expect(result.serviceOrderItems[1].pricingType).to.equal(pricingStructureTypes.PER_POUND);
    });

    it('should set status in the orderItems', async () => {
        payload.status = status;
        const result = await buildOrderItemsPayload(payload);
        expect(result.serviceOrderItems[0]).to.have.property('status').equal(status);
    });

    it('should set status as undefined in the orderItems when status is not sent ', async () => {
        const result = await buildOrderItemsPayload(payload);
        expect(result.serviceOrderItems[0]).to.have.property('status').equal(undefined);
    });

    describe('test price value for order item', () => {
        describe('per pound service price', () => {
            beforeEach(async () => {
                orderItems[0].category = 'PER_POUND';
            });
            it('should set the price value as minPrice when the totalWeight is equal to minQty', async () => {
                const result = await buildOrderItemsPayload(payload);
                expect(result.serviceOrderItems[0])
                    .to.have.property('totalPrice')
                    .to.equal(perPoundServicePayload.servicePrice.minPrice);
            });

            it('should set the price value as minPrice + (storePrice * remainingWeight)', async () => {
                const serviceMaster = perPoundServicePayload.serviceMaster;
                const servicePricingStructure = await ServicePricingStructure.query().findById(
                    serviceMaster.servicePricingStructureId,
                );
                const {
                    servicePrice: { minPrice, storePrice, minQty },
                } = perPoundServicePayload;
                payload.orderItems = [
                    {
                        priceId: perPoundServicePayload.servicePrice.id,
                        count: 1,
                        weight: 2,
                        serviceModifierIds: [],
                        lineItemType: 'SERVICE',
                        category: 'PER_POUND',
                        pricingType: servicePricingStructure.type,
                    },
                ];
                payload.totalWeight = 2;
                payload.chargeableWeight = 2;

                const expectedPrice =
                    minPrice + storePrice * (payload.orderItems[0].weight - minQty);

                const result = await buildOrderItemsPayload(payload);
                expect(result.serviceOrderItems[0])
                    .to.have.property('totalPrice')
                    .to.equal(expectedPrice);
            });

            it('should set the price value as storePrice * totalWeight when there is no minPrice', async () => {
                const perPoundServiceWithoutMinPrice = await createServicePayload(
                    store,
                    'PER_POUND',
                    0,
                );
                const serviceMaster = perPoundServiceWithoutMinPrice.serviceMaster;
                const servicePricingStructure = await ServicePricingStructure.query().findById(
                    serviceMaster.servicePricingStructureId,
                );
                const {
                    servicePrice: { id, storePrice },
                } = perPoundServiceWithoutMinPrice;
                payload.orderItems = [
                    {
                        priceId: id,
                        count: 1,
                        weight: 2,
                        serviceModifierIds: [],
                        lineItemType: 'SERVICE',
                        category: 'PER_POUND',
                        pricingType: servicePricingStructure.type,
                    },
                ];
                payload.totalWeight = 2;
                payload.chargeableWeight = 2;

                const expectedPrice = storePrice * payload.orderItems[0].weight;

                const result = await buildOrderItemsPayload(payload);
                expect(result.serviceOrderItems[0])
                    .to.have.property('totalPrice')
                    .to.equal(expectedPrice);
            });

            it('should set price as sum of item price and modifier price if modifiers are selected', async () => {
                const {
                    serviceModifier,
                    modifier,
                    servicePrice: { minPrice, minQty, storePrice },
                    serviceMaster,
                } = perPoundServicePayload;
                payload.orderItems[0].serviceModifierIds = [serviceModifier.id];
                payload.orderItems[0].weight = 2;
                payload.totalWeight = 2;
                payload.orderItems[0].chargeableWeight = 2;

                const servicePricingStructure = await ServicePricingStructure.query().findById(
                    serviceMaster.servicePricingStructureId,
                );
                payload.orderItems[0].pricingType = servicePricingStructure.type;

                const expectedPrice = 2 * modifier.price + (minPrice + (2 - minQty) * storePrice);
                const result = await buildOrderItemsPayload(payload);
                expect(result.serviceOrderItems[0])
                    .to.have.property('totalPrice')
                    .to.equal(expectedPrice);
            });
        });

        describe('fixed price service price', () => {
            it('should set the price as storePrice * count', async () => {
                const {
                    servicePrice: { id, storePrice },
                } = fixedPriceServicePayload;
                payload.orderItems = [
                    {
                        priceId: id,
                        count: 2,
                        lineItemType: 'SERVICE',
                        category: 'FIXED_PRICE',
                    },
                ];
                const expectedPrice = storePrice * 2;
                const result = await buildOrderItemsPayload(payload);
                expect(result.serviceOrderItems[0])
                    .to.have.property('totalPrice')
                    .to.equal(expectedPrice);
            });
        });
    });

    describe('test orderItemsTotal value', () => {
        describe('per pound service', () => {
            it('should match the totalPrice for perPound  item for weight equal to minQty', async () => {
                const totalPrice = perPoundServicePayload.servicePrice.minPrice;
                const result = await buildOrderItemsPayload(payload);
                expect(result.orderItemsTotal).to.equal(totalPrice);
            });

            it('should match the totalPrice for perPound  item for weight greater than minQty', async () => {
                payload.orderItems[0].weight = 2;
                const totalPrice = perPoundServicePayload.servicePrice.storePrice * 1;
                const result = await buildOrderItemsPayload(payload);
                expect(result.orderItemsTotal).to.equal(totalPrice);
            });
        });

        describe('fixed price service', () => {
            it('should match the totalPrice for fixed price item', async () => {
                payload.orderItems = [
                    {
                        priceId: fixedPriceServicePayload.servicePrice.id,
                        lineItemType: 'SERVICE',
                        count: 1,
                        category: 'FIXED_PRICE',
                    },
                ];
                const totalPrice = fixedPriceServicePayload.servicePrice.storePrice * 1;
                const result = await buildOrderItemsPayload(payload);
                expect(result.orderItemsTotal).to.equal(totalPrice);
            });
        });

        describe('test with weights', () => {
            beforeEach(async () => {
                const serviceMaster = perPoundServicePayload.serviceMaster;
                const servicePricingStructure = await ServicePricingStructure.query().findById(
                    serviceMaster.servicePricingStructureId,
                );
                payload.orderItems = [
                    {
                        priceId: perPoundServicePayload.servicePrice.id,
                        count: 1,
                        weight: 1,
                        serviceModifierIds: [],
                        lineItemType: 'SERVICE',
                        category: 'PER_POUND',
                        hasMinPrice: true,
                        pricingType: servicePricingStructure.type,
                    },
                ];
                payload.totalWeight = 5;
                payload.orderItems[0].weight = 5;
            });
            it('should take only the chargable weight for price calculations', async () => {
                payload.orderItems[0].chargeableWeight = 5;
                const result = await buildOrderItemsPayload(payload);
                expect(result.orderItemsTotal).to.equal(50);
            });

            it('should take totalWeight for price calculations', async () => {
                payload.orderItems[0].chargeableWeight = 5;
                const result = await buildOrderItemsPayload(payload);
                expect(result.orderItemsTotal).to.equal(50);
            });
        });
    });
});

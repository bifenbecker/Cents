require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const {
    validateServiceOrderItems,
    validateInventoryItems,
} = require('../../../../../uow/order/serviceOrder/validateServiceOrderItems');
const { createOrderItemMock } = require('../../../../support/createOrderMocksHelper');
const { createInventoryPayload } = require('../../../../support/serviceOrderTestHelper');

const composedShouldBeRejectedWith =
    (expectFn, testedFn) =>
    async (expectedError, ...args) =>
        await expectFn(testedFn(...args)).to.be.rejectedWith(expectedError);

describe('test validateServiceOrderItems UOW', () => {
    let store, serviceOrder, centsCustomer;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        centsCustomer = await factory.create(FN.centsCustomer);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
    });

    it('should fail if there is no store services with passed priceId', async () => {
        await composedShouldBeRejectedWith(expect, validateServiceOrderItems)(
            'service not found.',
            {
                orderItems: [
                    createOrderItemMock({
                        priceId: -1,
                    }),
                ],
                store,
                serviceOrderId: serviceOrder.id,
                centsCustomerId: centsCustomer.id,
            },
        );
    });

    it('should return serviceItems', async () => {
        const servicePrice = await factory.create(FN.servicePrice, {
            storeId: store.id,
        });
        const result = await validateServiceOrderItems({
            orderItems: [
                createOrderItemMock({
                    priceId: servicePrice.id,
                }),
            ],
            store,
            serviceOrderId: serviceOrder.id,
            centsCustomerId: centsCustomer.id,
        });

        expect(result).to.have.property('orderItems').to.not.be.empty;
        expect(result).to.have.property('inventoryOrderItems').to.be.empty;
        expect(result.orderItems.length).to.equal(1);
        expect(result.orderItems[0]).to.have.property('priceId').to.equal(servicePrice.id);
        expect(result).to.have.property('serviceOrderId').to.equal(serviceOrder.id);
        expect(result).to.have.property('centsCustomerId').to.equal(centsCustomer.id);
    });

    describe('with inventory items', () => {
        let orderItems, payload, inventoryItem, inventory;

        beforeEach(async () => {
            (payload = await createInventoryPayload(store)),
                (inventoryItem = payload.inventoryItem);
            inventory = payload.inventory;
            orderItems = [
                {
                    priceId: inventoryItem.id,
                    count: inventoryItem.quantity,
                    lineItemType: 'INVENTORY',
                },
            ];
        });

        it('should throw not found error if non existing inventory item is sent', async () => {
            orderItems[0].priceId = 100;
            const result = await expect(
                validateServiceOrderItems({
                    orderItems,
                    store,
                }),
            ).rejectedWith(Error);
            expect(result).to.have.property('message').equal(`Inventory item not found.`);
        });

        it('should throw error if count is greater than the inventory item quantity', async () => {
            orderItems[0].count = inventoryItem.quantity + 1;
            const result = await expect(
                validateServiceOrderItems({
                    orderItems,
                    store,
                }),
            ).rejectedWith(Error);
            expect(result).to.have.property('message')
                .equal(`Available quantity for ${inventory.productName} is ${inventoryItem.quantity}.
             Please update the order quantity for ${inventory.productName}`);
        });

        it('should throw duplicate items error if duplicate inventory items are sent in orderItems', async () => {
            orderItems[1] = orderItems[0];
            const result = await expect(
                validateServiceOrderItems({
                    orderItems,
                    store,
                }),
            ).rejectedWith(Error);
            expect(result)
                .to.have.property('message')
                .equal('Duplicate products found in the order.');
        });
    });

    it('should return inventoryItems', async () => {
        const inventoryItem = await factory.create(FN.inventoryItem, {
            storeId: store.id,
        });
        const orderItem = createOrderItemMock({
            priceId: inventoryItem.id,
            lineItemType: 'INVENTORY',
        });
        const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });
        const serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
            inventoryItemId: inventoryItem.id,
        });
        const result = await validateServiceOrderItems({
            orderItems: [
                {
                    ...orderItem,
                    id: 999,
                },
            ],
            store,
            serviceOrderId: serviceOrder.id,
            centsCustomerId: centsCustomer.id,
        });

        expect(result).to.have.property('orderItems').to.not.be.empty;
        expect(result).to.have.property('inventoryOrderItems').to.not.be.empty;
        expect(result.orderItems.length).to.equal(1);
        expect(result.orderItems[0]).to.have.property('priceId').to.equal(inventoryItem.id);
        expect(result.orderItems[0])
            .to.have.property('changeInQuantity')
            .to.equal(serviceReferenceItem.quantity - orderItem.count);
        expect(result.inventoryOrderItems.length).to.equal(1);
        expect(result.inventoryOrderItems[0])
            .to.have.property('priceId')
            .to.equal(inventoryItem.id);
        expect(result).to.have.property('serviceOrderId').to.equal(serviceOrder.id);
        expect(result).to.have.property('centsCustomerId').to.equal(centsCustomer.id);
    });

    it('should return inventoryItems with tierId', async () => {
        const pricingTiers = await factory.create(FN.pricingTier, {
            businessId: store.businessId,
        });
        const serviceOrderWithTiers = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            tierId: pricingTiers.id,
        });
        const inventoryItem = await factory.create(FN.inventoryItem, {
            storeId: store.id,
            pricingTierId: pricingTiers.id,
        });
        const orderItem = createOrderItemMock({
            priceId: inventoryItem.id,
            lineItemType: 'INVENTORY',
        });
        const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrderWithTiers.id,
        });
        const serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
            inventoryItemId: inventoryItem.id,
        });
        const result = await validateServiceOrderItems({
            orderItems: [
                {
                    ...orderItem,
                    id: 999,
                    isDeleted: true,
                },
            ],
            store,
            serviceOrderId: serviceOrderWithTiers.id,
            centsCustomerId: centsCustomer.id,
        });

        expect(result).to.have.property('orderItems').to.not.be.empty;
        expect(result).to.have.property('inventoryOrderItems').to.not.be.empty;
        expect(result.orderItems.length).to.equal(1);
        expect(result.orderItems[0]).to.have.property('priceId').to.equal(inventoryItem.id);
        expect(result.inventoryOrderItems.length).to.equal(1);
        expect(result.inventoryOrderItems[0])
            .to.have.property('priceId')
            .to.equal(inventoryItem.id);
        expect(result.orderItems[0])
            .to.have.property('changeInQuantity')
            .to.equal(serviceReferenceItem.quantity);
        expect(result).to.have.property('serviceOrderId').to.equal(serviceOrderWithTiers.id);
        expect(result).to.have.property('centsCustomerId').to.equal(centsCustomer.id);
    });

    describe('for PER_POUND', () => {
        let perPoundPricingType, perPoundServiceCategory, serviceMaster, servicePrice;

        beforeEach(async () => {
            perPoundPricingType = await factory.create(FN.servicePricingStructure, {
                type: 'PER_POUND',
            });
            perPoundServiceCategory = await factory.create(FN.perPoundServiceCategory);
            serviceMaster = await factory.create(FN.serviceMaster, {
                serviceCategoryId: perPoundServiceCategory.id,
                servicePricingStructureId: perPoundPricingType.id,
            });
            servicePrice = await factory.create(FN.servicePrice, {
                storeId: store.id,
                serviceId: serviceMaster.id,
            });
        });

        it('should fail when weight is null', async () => {
            const orderItem = createOrderItemMock({
                priceId: servicePrice.id,
                category: 'PER_POUND',
                weight: null,
                pricingType: 'PER_POUND',
            });

            await composedShouldBeRejectedWith(expect, validateServiceOrderItems)(
                `Weight measurement is required for ${serviceMaster.name}.`,
                {
                    orderItems: [orderItem],
                    store,
                    serviceOrderId: serviceOrder.id,
                    centsCustomerId: centsCustomer.id,
                },
            );
        });

        it(`should fail when modifier with given id not found`, async () => {
            const orderItem = createOrderItemMock({
                priceId: servicePrice.id,
                category: 'PER_POUND',
                serviceModifierIds: [-1],
            });
            await composedShouldBeRejectedWith(expect, validateServiceOrderItems)(
                'Modifier not found',
                {
                    orderItems: [orderItem],
                    store,
                    serviceOrderId: serviceOrder.id,
                    centsCustomerId: centsCustomer.id,
                },
            );
        });

        it(`should fail when modifier is not featured`, async () => {
            const modifier = await factory.create(FN.modifier, {
                businessId: store.businessId,
            });
            const serviceModifier = await factory.create(FN.serviceModifier, {
                serviceId: serviceMaster.id,
                modifierId: modifier.id,
                isFeatured: false,
            });
            const orderItem = createOrderItemMock({
                priceId: servicePrice.id,
                category: 'PER_POUND',
                serviceModifierIds: [serviceModifier.id],
            });

            await composedShouldBeRejectedWith(expect, validateServiceOrderItems)(
                `${modifier.name} is not available.`,
                {
                    orderItems: [orderItem],
                    store,
                    serviceOrderId: serviceOrder.id,
                    centsCustomerId: centsCustomer.id,
                },
            );
        });

        it('should not throw any error with valid payload with out serviceModifierIds', async () => {
            const orderItems = [
                createOrderItemMock({
                    priceId: servicePrice.id,
                    count: 2,
                    weight: 2,
                    serviceModifierIds: [],
                    lineItemType: 'SERVICE',
                }),
            ];
            expect(
                validateServiceOrderItems({
                    orderItems,
                    store,
                }),
            ).not.to.be.rejected;
        });

        it('should not throw any error with valid payload with serviceModifierIds', async () => {
            const orderItems = [
                createOrderItemMock({
                    priceId: servicePrice.id,
                    count: 2,
                    weight: 2,
                    serviceModifierIds: [1],
                    lineItemType: 'SERVICE',
                }),
            ];
            expect(
                validateServiceOrderItems({
                    orderItems,
                    store,
                }),
            ).not.to.be.rejected;
        });
    });
    describe('validateInventoryItems test', function () {
        let orderItems, payload, inventoryItem, inventory;

        beforeEach(async () => {
            payload = await createInventoryPayload(store);
            inventoryItem = payload.inventoryItem;
            inventory = payload.inventory;
            orderItems = [
                createOrderItemMock({
                    priceId: inventoryItem.id,
                    count: inventoryItem.quantity,
                    lineItemType: 'INVENTORY',
                }),
            ];
        });

        it('should throw error if orderItems with duplicated priceIds provided', async () => {
            await composedShouldBeRejectedWith(expect, validateInventoryItems)(
                'Duplicate products found in the order.',
                [...orderItems, ...orderItems],
                store.id,
                null,
                serviceOrder.id,
            );
        });

        it('should throw error if orderItems with wrong price id provided', async () => {
            await composedShouldBeRejectedWith(expect, validateInventoryItems)(
                'Inventory item not found.',
                [
                    {
                        ...orderItems,
                        priceId: -12345,
                    },
                ],
                store.id,
                null,
                serviceOrder.id,
            );
        });

        it('should return inventoryItems', async () => {
            const result = await validateInventoryItems(
                orderItems,
                store.id,
                null,
                serviceOrder.id,
            );

            expect(result.length).to.be.equal(1);
            expect(result[0].priceId).equal(orderItems[0].priceId);
            expect(result[0].count).equal(orderItems[0].count);
            expect(result[0].weight).equal(orderItems[0].weight);
            expect(result[0].lineItemType).equal(orderItems[0].lineItemType);
            expect(result[0].category).equal(orderItems[0].category);
        });
    });
});

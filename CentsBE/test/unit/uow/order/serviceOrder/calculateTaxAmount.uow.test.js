require('../../../../testHelper');
const sinon = require('sinon');
const StoreQuery = require('../../../../../queryHelpers/store');
const InventoryItem = require('../../../../../models/inventoryItem');
const ServicePrices = require('../../../../../models/servicePrices');
const calculateTaxAmount = require('../../../../../uow/order/serviceOrder/calculateTaxAmount');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

const createPricingTierFactory = async (store) => {
    const pricingTier = await factory.create(FN.pricingTier, {
        businessId: store.businessId,
    });

    return {
        pricingTier
    }
};

const createServicePayloadWithPricingTiers = async (store, isTaxable = true) => {
    const { pricingTier } = await createPricingTierFactory(store);

    const serviceCategory = await factory.create(FN.serviceCategory, {
        businessId: store.businessId,
        category: 'FIXED_PRICE',
    });

    const serviceMaster = await factory.create(FN.serviceMaster, {
        serviceCategoryId: serviceCategory.id,
    });

    const servicePrice = await factory.create(FN.servicePrice, {
        storeId: store.id,
        serviceId: serviceMaster.id,
        minPrice: 10,
        isTaxable,
        isDeliverable: true,
        pricingTierId: pricingTier.id,
    });

    const modifier = await factory.create(FN.modifier, {
        businessId: store.businessId,
    });

    const serviceModifier = await factory.create(FN.serviceModifier, {
        serviceId: serviceMaster.id,
        isFeatured: false,
        modifierId: modifier.id,
    });

    return {
        serviceCategory,
        serviceMaster,
        servicePrice,
        serviceModifier,
        modifier
    };
};

const createInventoryPayloadWithPricingTiers = async (store, isTaxable = true) => {
    const { pricingTier } = await createPricingTierFactory(store);

    const inventoryCategory = await factory.create(FN.inventoryCategory, {
        businessId: store.businessId,
    });

    const inventory = await factory.create(FN.inventory, {
        categoryId: inventoryCategory.id,
    });

    const inventoryItem = await factory.create(FN.inventoryItem, {
        storeId: store.id,
        inventoryId: inventory.id,
        isTaxable,
        pricingTierId: pricingTier.id
    });

    return {
        inventoryItem,
        inventory
    };
};

describe('test calculatetaxAmount UOW', () => {
    let store, payload, taxRate;
    beforeEach(async () => {
        const laundromatBusiness = await factory.create(FN.laundromatBusiness);
        taxRate = await factory.create(FN.taxRate, {
            businessId: laundromatBusiness.id,
            rate: 5,
        });

        store = await factory.create(FN.store, {
            taxRateId: taxRate.id,
            businessId: laundromatBusiness.id,
        });
    });

    describe('inventory items', () => {
        let isTaxableInventoryPayload;
        beforeEach(async () => {
            isTaxableInventoryPayload = await createInventoryPayloadWithPricingTiers(store);
            serviceOrderItems = [
                {
                    priceId: isTaxableInventoryPayload.inventoryItem.id,
                    totalPrice: 100,
                    referenceItems: [
                        {
                            inventoryItemId: isTaxableInventoryPayload.inventoryItem.id,
                        },
                    ],
                    lineItemType: 'INVENTORY',
                },
            ];

            await InventoryItem.query()
                .patch({
                    isDeleted: false,
                })
                .where({ storeId: store.id })
                .returning('*');

            payload = {
                serviceOrderItems,
                store
            }
        })

        it('should calculate the tax amount on the items price', async () => {
            const result = await calculateTaxAmount(payload);
            expect(result).to.have.property('taxAmountInCents').equal(500);
        });

        it('should return taxAmount as 0 when items are not taxable', async () => {
            const nonTaxablePayload = await createInventoryPayloadWithPricingTiers(store, false);
            payload.serviceOrderItems = [
                {
                    price: 100,
                    priceId: nonTaxablePayload.inventoryItem.id,
                    referenceItems: [
                        {
                            servicePriceId: nonTaxablePayload.inventoryItem.id,
                        },
                    ],
                    lineItemType: 'INVENTORY',
                },
            ];
            const result = await calculateTaxAmount(payload);
            expect(result).to.have.property('taxAmountInCents').equal(0);
        });

        it('should return storeItemDetails when pricingTierId is present and lineItemType is INVENTORY', async () => {
            payload = {
                serviceOrderItems,
                store
            }

            const result = await calculateTaxAmount(payload);
            expect(result).to.have.property('taxAmountInCents').equal(500);
        });

        it('should return undefined after calling storeQuery.taxRate', async () => {
            const spyTaxRate = sinon
                .stub(StoreQuery.prototype, 'taxRate')
                .callsFake(() => undefined);

            await calculateTaxAmount(payload);
            sinon.assert.calledOnce(spyTaxRate);
        });
    });

    describe('modifier items', () => {
        let isTaxableInventoryPayload;
        beforeEach(async () => {
            isTaxableInventoryPayload = await createInventoryPayloadWithPricingTiers(store);
            serviceOrderItems = [
                {
                    priceId: isTaxableInventoryPayload.inventoryItem.id,
                    totalPrice: 100,
                    referenceItems: [
                        {
                            inventoryItemId: isTaxableInventoryPayload.inventoryItem.id,
                        },
                    ],
                    lineItemType: 'MODIFIER',
                },
            ];
            payload = {
                serviceOrderItems,
                store
            }
        })

        it('should return taxAmount as 0 when lineItemType is MODIFIER', async () => {
            const result = await calculateTaxAmount(payload);
            expect(result).to.have.property('taxAmountInCents').equal(0);
        });
    });

    describe('service items', () => {
        let isTaxableServicePayload;
        beforeEach(async () => {
            isTaxableServicePayload = await createServicePayloadWithPricingTiers(store);
            serviceOrderItems = [
                {
                    priceId: isTaxableServicePayload.servicePrice.id,
                    totalPrice: 100,
                    referenceItems: [
                        {
                            servicePriceId: isTaxableServicePayload.servicePrice.id,
                        },
                    ],
                    lineItemType: 'SERVICE',
                },
            ];
            payload = {
                serviceOrderItems,
                store
            }
        })

        it('should calculate the tax amount on the items price', async () => {
            const result = await calculateTaxAmount(payload);
            expect(result).to.have.property('taxAmountInCents').equal(500);
        });

        it('should return taxAmount as 0 when items are not taxable', async () => {
            const nonTaxablePayload = await createServicePayloadWithPricingTiers(store, false);
            payload.serviceOrderItems = [
                {
                    price: 100,
                    priceId: nonTaxablePayload.servicePrice.id,
                    referenceItems: [
                        {
                            servicePriceId: nonTaxablePayload.servicePrice.id,
                        },
                    ],
                    lineItemType: 'SERVICE',
                },
            ];
            const result = await calculateTaxAmount(payload);
            expect(result).to.have.property('taxAmountInCents').equal(0);
        });

        it('should apply tax on the orderTotal - promotionAmount if promotion is applied', async () => {
            payload.serviceOrderItems[0].promotionAmountInCents = 20;
            const result = await calculateTaxAmount(payload);
            expect(result).to.have.property('taxAmountInCents').equal(499);
        });

        it('should return storeItemDetails when pricingTierId is present and lineItemType is SERVICE', async () => {
            const isTaxableServicePayload = await createServicePayloadWithPricingTiers(store);

            await ServicePrices.query()
                .patch({
                    deletedAt: new Date(),
                })
                .where({ storeId: store.id })
                .returning('*');

            serviceOrderItems = [
                {
                    priceId: isTaxableServicePayload.servicePrice.id,
                    totalPrice: 100,
                    referenceItems: [
                        {
                            servicePriceId: isTaxableServicePayload.servicePrice.id,
                        },
                    ],
                    lineItemType: 'SERVICE',
                },
            ];

            payload = {
                serviceOrderItems,
                store
            }

            const result = await calculateTaxAmount(payload);
            expect(result).to.have.property('taxAmountInCents').equal(0);
        });
    });
});

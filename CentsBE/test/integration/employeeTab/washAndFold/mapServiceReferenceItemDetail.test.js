require('../../../testHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { expect } = require('../../../support/chaiHelper');
const mapServiceReferenceItemDetail = require('../../../../routes/employeeTab/washAndFold/mapServiceReferenceItemDetail');
const { pricingStructureTypes } = require('../../../../constants/constants');

describe('test mapServiceReferenceItemDetail', () => {
    let business,
        store,
        pricingStructure,
        serviceCategoryType,
        serviceCategory,
        service,
        servicePrice,
        inventoryCategory,
        inventory,
        inventoryItem,
        centsCustomer,
        storeCustomer,
        serviceOrder,
        serviceOrderItem,
        serviceReferenceItem;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        pricingStructure = await factory.create(FACTORIES_NAMES.servicePricingStructure);
        serviceCategoryType = await factory.create(FACTORIES_NAMES.serviceCategoryType);
        serviceCategory = await factory.create(FACTORIES_NAMES.serviceCategory, {
            businessId: business.id,
            serviceCategoryTypeId: serviceCategoryType.id,
        });
        service = await factory.create(FACTORIES_NAMES.serviceMaster, {
            serviceCategoryId: serviceCategory.id,
            servicePricingStructureId: pricingStructure.id,
        });
        servicePrice = await factory.create(FACTORIES_NAMES.servicePrice, {
            serviceId: service.id,
            storeId: store.id,
        });
        inventoryCategory = await factory.create(FACTORIES_NAMES.inventoryCategory, {
            businessId: business.id,
        });
        inventory = await factory.create(FACTORIES_NAMES.inventory, {
            categoryId: inventoryCategory.id,
        });
        inventoryItem = await factory.create(FACTORIES_NAMES.inventoryItem, {
            inventoryId: inventory.id,
            storeId: store.id,
        });
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            firstName: centsCustomer.firstName,
            lastName: centsCustomer.lastName,
            phoneNumber: centsCustomer.phoneNumber,
            email: centsCustomer.email,
            businessId: business.id,
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
        });
        serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });
        serviceOrderItem = await factory.create(FACTORIES_NAMES.serviceOrderItem, {
            orderId: serviceOrder.id,
        });
        serviceReferenceItem = await factory.create(FACTORIES_NAMES.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
            servicePriceId: servicePrice.id,
        });
    });

    it('should return a formatted serviceReferenceItemDetail object for a Service object', async () => {
        const customer = {
            fullName: `${storeCustomer.firstName} ${storeCustomer.lastName}`,
            phoneNumber: storeCustomer.phoneNumber,
        };
        const hasMinPrice = service.hasMinPrice;
        const minPrice = hasMinPrice ? servicePrice.minPrice : null;
        const minQuantity = hasMinPrice ? servicePrice.minQty : null;
        const result = await mapServiceReferenceItemDetail(serviceReferenceItem, customer);

        expect(result.soldItemId).to.equal(servicePrice.id);
        expect(result.soldItemType).to.equal('ServicePrices');
        expect(result.lineItemName).to.equal(service.name);
        expect(result.lineItemDescription).to.equal(service.description);
        expect(result.lineItemTotalCost).to.equal(serviceReferenceItem.totalPrice);
        expect(result.lineItemQuantity).to.equal(serviceReferenceItem.quantity);
        expect(result.lineItemUnitCost).to.equal(servicePrice.storePrice);
        expect(result.lineItemMinPrice).to.equal(minPrice);
        expect(result.lineItemMinQuantity).to.equal(minQuantity);
        expect(result.customerName).to.equal(customer.fullName);
        expect(result.customerPhoneNumber).to.equal(customer.phoneNumber);
        expect(result.category).to.equal(serviceCategory.category);
        expect(result.pricingType).to.equal(pricingStructure.type);
        expect(result.serviceCategoryType).to.equal(serviceCategoryType.type);
    });

    it('should return a formatted serviceReferenceItemDetail object for an InventoryItem object', async () => {
        const serviceOrderWithInventory = await factory.create(FACTORIES_NAMES.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });
        const serviceOrderItemWithInventory = await factory.create(
            FACTORIES_NAMES.serviceOrderItem,
            {
                orderId: serviceOrderWithInventory.id,
            },
        );
        const serviceReferenceItemWithInventory = await factory.create(
            FACTORIES_NAMES.serviceReferenceItem,
            {
                orderItemId: serviceOrderItemWithInventory.id,
                inventoryItemId: inventoryItem.id,
            },
        );
        const customer = {
            fullName: `${storeCustomer.firstName} ${storeCustomer.lastName}`,
            phoneNumber: storeCustomer.phoneNumber,
        };
        const result = await mapServiceReferenceItemDetail(
            serviceReferenceItemWithInventory,
            customer,
        );

        expect(result.soldItemId).to.equal(inventoryItem.id);
        expect(result.soldItemType).to.equal('InventoryItem');
        expect(result.lineItemName).to.equal(inventory.productName);
        expect(result.lineItemDescription).to.equal(inventory.description);
        expect(result.lineItemTotalCost).to.equal(serviceReferenceItem.totalPrice);
        expect(result.lineItemQuantity).to.equal(serviceReferenceItem.quantity);
        expect(result.lineItemUnitCost).to.equal(inventoryItem.price);
        expect(result.lineItemMinPrice).to.equal(null);
        expect(result.lineItemMinQuantity).to.equal(null);
        expect(result.customerName).to.equal(customer.fullName);
        expect(result.customerPhoneNumber).to.equal(customer.phoneNumber);
        expect(result.category).to.equal(inventoryCategory.name);
        expect(result.pricingType).to.equal(pricingStructureTypes.FIXED_PRICE);
        expect(result.serviceCategoryType).to.equal('INVENTORY');
    });

    it('customerName and customerPhoneNumber should be undefined when customer not passed', async () => {
        const serviceReferenceItemDetail = await mapServiceReferenceItemDetail(
            serviceReferenceItem,
        );

        expect(serviceReferenceItemDetail).to.have.property('customerName').to.be.undefined;
        expect(serviceReferenceItemDetail).to.have.property('customerPhoneNumber').to.be.undefined;
    });

    it('should include modifierLineItem for when one modifier is added', async () => {
        const { modifier } = await factory.create(FACTORIES_NAMES.modifierAndModifierVersion, {
            businessId: business.id,
            name: 'Lavender Spritz',
            description: 'The best spritz one could ask for',
            price: 0.1,
        });

        const customer = {
            fullName: `${storeCustomer.firstName} ${storeCustomer.lastName}`,
            phoneNumber: storeCustomer.phoneNumber,
        };
        const modifierPayload = [
            {
                modifierId: modifier.id,
                name: modifier.name,
                price: modifier.price,
                modifierPricingType: modifier.pricingType,
                weight: 12,
                modifierVersionId: modifier.latestModifierVersion,
            },
        ];
        const result = await mapServiceReferenceItemDetail(
            serviceReferenceItem,
            customer,
            modifierPayload,
        );

        expect(result.modifierLineItems).to.not.be.undefined;
        expect(result.modifierLineItems.length).to.equal(1);
        expect(result.modifierLineItems[0].modifierId).to.equal(modifier.id);
        expect(result.modifierLineItems[0].modifierName).to.equal(modifier.name);
        expect(result.modifierLineItems[0].unitCost).to.equal(modifier.price);
        expect(result.modifierLineItems[0].quantity).to.equal(12);
        expect(result.modifierLineItems[0].totalCost).to.equal(modifier.price * 12);
        expect(result.modifierLineItems[0].modifierPricingType).to.equal(modifier.pricingType);
        expect(result.modifierLineItems[0].modifierVersionId).to.equal(
            modifierPayload[0].modifierVersionId,
        );
    });

    it('should include modifierLineItem for when multiple modifier is added', async () => {
        const { modifier } = await factory.create(FACTORIES_NAMES.modifierAndModifierVersion, {
            businessId: business.id,
            name: 'Lavender Spritz',
            description: 'The best spritz one could ask for',
            price: 0.1,
        });

        const { modifier: secondModifier } = await factory.create(
            FACTORIES_NAMES.modifierAndModifierVersion,
            {
                businessId: business.id,
                name: 'Oxygen Brightener',
                description: 'Brighten up with some O2',
                price: 0.2,
            },
        );

        const customer = {
            fullName: `${storeCustomer.firstName} ${storeCustomer.lastName}`,
            phoneNumber: storeCustomer.phoneNumber,
        };
        const modifierPayload = [
            {
                modifierId: modifier.id,
                name: modifier.name,
                price: modifier.price,
                weight: 12,
                modifierPricingType: modifier.pricingType,
                modifierVersionId: modifier.latestModifierVersion,
            },
            {
                modifierId: secondModifier.id,
                name: secondModifier.name,
                price: secondModifier.price,
                weight: 22,
                modifierPricingType: secondModifier.pricingType,
                modifierVersionId: secondModifier.latestModifierVersion,
            },
        ];
        const result = await mapServiceReferenceItemDetail(
            serviceReferenceItem,
            customer,
            modifierPayload,
        );

        expect(result.modifierLineItems).to.not.be.undefined;
        expect(result.modifierLineItems.length).to.equal(2);

        const lavenderSpritzModifier = result.modifierLineItems.find(
            (item) => item.modifierId === modifier.id,
        );
        expect(lavenderSpritzModifier.modifierId).to.equal(modifier.id);
        expect(lavenderSpritzModifier.modifierName).to.equal(modifier.name);
        expect(lavenderSpritzModifier.unitCost).to.equal(modifier.price);
        expect(lavenderSpritzModifier.quantity).to.equal(12);
        expect(lavenderSpritzModifier.totalCost).to.equal(modifier.price * 12);
        expect(lavenderSpritzModifier.modifierPricingType).to.equal(modifier.pricingType);
        expect(lavenderSpritzModifier.modifierVersionId).to.equal(
            modifierPayload[0].modifierVersionId,
        );

        const oxygenModifier = result.modifierLineItems.find(
            (item) => item.modifierId === secondModifier.id,
        );
        expect(oxygenModifier.modifierId).to.equal(secondModifier.id);
        expect(oxygenModifier.modifierName).to.equal(secondModifier.name);
        expect(oxygenModifier.unitCost).to.equal(secondModifier.price);
        expect(oxygenModifier.quantity).to.equal(22);
        expect(oxygenModifier.totalCost).to.equal(secondModifier.price * 22);
        expect(oxygenModifier.modifierPricingType).to.equal(secondModifier.pricingType);
        expect(oxygenModifier.modifierVersionId).to.equal(modifierPayload[1].modifierVersionId);
    });

    it('should throw an error if payload is empty', async () => {
        try {
            await mapServiceReferenceItemDetail();
        } catch (error) {
            return error;
        }

        // assert error type
        expect(error).to.be.an('Error');

        // assert error message - here, since referenceItem is undefined, first item compared should be undefined
        expect(error.message).to.contain(
            `Cannot read properties of undefined (reading 'inventoryItemId')`,
        );
    });
});

require('../../../../../testHelper');
const { expect } = require('../../../../../support/chaiHelper');
const factory = require('../../../../../factories');
const { FACTORIES_NAMES } = require('../../../../../constants/factoriesNames');
const BaseItemBuilder = require('../../../../../../services/orders/builders/serviceOrderItems/baseItemBuilder');

describe('test BaseItemBuilder class', () => {
    let business,
        store,
        centsCustomer,
        serviceCategoryType,
        servicePricingStructure,
        serviceCategory,
        serviceMaster,
        servicePrice,
        item,
        customerDetails;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        serviceCategoryType = await factory.create(FACTORIES_NAMES.serviceCategoryType);
        servicePricingStructure = await factory.create(FACTORIES_NAMES.servicePricingStructure);
        serviceCategory = await factory.create(FACTORIES_NAMES.serviceCategory, {
            businessId: business.id,
            serviceCategoryTypeId: serviceCategoryType.id,
            category: 'This is a non-standard category',
        });
        serviceMaster = await factory.create(FACTORIES_NAMES.serviceMaster, {
            serviceCategoryId: serviceCategory.id,
            servicePricingStructureId: servicePricingStructure.id,
        });
        servicePrice = await factory.create(FACTORIES_NAMES.servicePrice, {
            serviceId: serviceMaster.id,
            minPrice: null,
        });
        item = {
            priceId: servicePrice.id,
            price: servicePrice.storePrice,
            storeId: store.id,
            lineItemName: serviceMaster.name,
            hasMinPrice: servicePrice.minPrice ? true : false,
            minimumQuantity: servicePrice.minQty,
            minimumPrice: servicePrice.minPrice,
            isTaxable: servicePrice.isTaxable,
            description: serviceMaster.description,
            category: serviceCategory.category,
            lineItemType: 'SERVICE',
            serviceId: serviceMaster.id,
            weight: 0,
            count: 1,
            isDeliverable: servicePrice.isDeliverable,
            pricingTierId: servicePrice.pricingTierId,
            servicePricingStructureType: servicePricingStructure.type,
            serviceCategoryType: serviceCategoryType.type,
        };
        customerDetails = {
            customerName: `${centsCustomer.firstName} ${centsCustomer.lastName}`,
            customerPhoneNumber: centsCustomer.phoneNumber,
        };
    });

    it('should create an instance of the class', async () => {
        const baseItemBuilder = new BaseItemBuilder(item, customerDetails, 'SUBMITTED');

        expect(baseItemBuilder).to.have.property('item').deep.equal(item);
        expect(baseItemBuilder).to.have.property('customer').deep.equal(customerDetails);
        expect(baseItemBuilder).to.have.property('status').equal('SUBMITTED');
        expect(baseItemBuilder).to.have.property('newItem').deep.equal({});
        expect(baseItemBuilder).to.have.property('inventory').deep.equal({});
    });

    it('itemPrice should return the price of the item if pricing type is not PER_POUND', async () => {
        item.servicePricingStructureType = 'FIXED_PRICE';

        const baseItemBuilder = new BaseItemBuilder(item, customerDetails, 'SUBMITTED');
        const itemPrice = baseItemBuilder.itemPrice();

        expect(itemPrice).to.equal(item.price * item.count);
    });

    it('itemPrice should return the price of the item if pricing type is PER_POUND', async () => {
        item.hasMinPrice = false;
        item.servicePricingStructureType = 'PER_POUND';

        const baseItemBuilder = new BaseItemBuilder(item, customerDetails, 'SUBMITTED');
        const itemPrice = baseItemBuilder.itemPrice();

        expect(itemPrice).to.equal(item.price * item.weight);
    });

    it('itemPrice should return the price of the item if pricing type is not PER_POUND but item is Modifier', async () => {
        item.hasMinPrice = false;
        item.servicePricingStructureType = 'FIXED_PRICE';
        item.lineItemType = 'MODIFIER';

        const baseItemBuilder = new BaseItemBuilder(item, customerDetails, 'SUBMITTED');
        const itemPrice = baseItemBuilder.itemPrice();

        expect(itemPrice).to.equal(item.price * item.weight);
    });

    it('nonModifierLineItemDetails should build the ServiceReferenceItemDetails payload', async () => {
        const baseItemBuilder = new BaseItemBuilder(item, customerDetails, 'SUBMITTED');

        // nonModifierLineItemDetails requires newItem to be set
        baseItemBuilder.buildItemAttributes();

        const itemPrice = baseItemBuilder.itemPrice();
        const nonModifierLineItemDetails = baseItemBuilder.nonModifierLineItemDetails();
        const expectedLineItemQuantity =
            item.pricingType === 'PER_POUND' ? item.weight : item.count;

        expect(nonModifierLineItemDetails).to.have.property('soldItemType').equal('ServicePrices');
        expect(nonModifierLineItemDetails)
            .to.have.property('lineItemName')
            .equal(item.lineItemName);
        expect(nonModifierLineItemDetails).to.have.property('lineItemUnitCost').equal(item.price);
        expect(nonModifierLineItemDetails)
            .to.have.property('lineItemDescription')
            .equal(item.description);
        expect(nonModifierLineItemDetails)
            .to.have.property('lineItemQuantity')
            .equal(expectedLineItemQuantity);
        expect(nonModifierLineItemDetails).to.have.property('lineItemTotalCost').equal(itemPrice);
        expect(nonModifierLineItemDetails).to.have.property('soldItemId').equal(item.priceId);
        expect(nonModifierLineItemDetails)
            .to.have.property('lineItemMinPrice')
            .equal(item.hasMinPrice ? item.minimimPrice : null);
        expect(nonModifierLineItemDetails)
            .to.have.property('lineItemMinQuantity')
            .equal(item.hasMinPrice ? item.minimumQuantity : null);
        expect(nonModifierLineItemDetails)
            .to.have.property('customerName')
            .equal(customerDetails.customerName);
        expect(nonModifierLineItemDetails)
            .to.have.property('customerPhoneNumber')
            .equal(customerDetails.customerPhoneNumber);
        expect(nonModifierLineItemDetails)
            .to.have.property('pricingType')
            .equal(item.servicePricingStructureType);
        expect(nonModifierLineItemDetails)
            .to.have.property('serviceCategoryType')
            .equal(item.serviceCategoryType);
        expect(nonModifierLineItemDetails).to.have.property('modifierLineItems').deep.equal([]);
    });

    it('nonModifierLineItemDetails should build the ServiceReferenceItemDetails payload with modifierLineItem', async () => {
        const modifier = await factory.create(FACTORIES_NAMES.modifier, {
            businessId: business.id,
        });
        const serviceModifier = await factory.create(FACTORIES_NAMES.serviceModifier, {
            serviceId: serviceMaster.id,
            modifierId: modifier.id,
        });
        item.modifiers = [
            {
                serviceModifierId: serviceModifier.id,
                price: modifier.price,
                name: modifier.name,
                description: modifier.descrition,
                modifierId: modifier.id,
                modifierPricingType: modifier.pricingType,
            },
        ];
        const baseItemBuilder = new BaseItemBuilder(item, customerDetails, 'SUBMITTED');

        // nonModifierLineItemDetails requires newItem to be set
        baseItemBuilder.buildItemAttributes();

        const itemPrice = baseItemBuilder.itemPrice();
        const nonModifierLineItemDetails = baseItemBuilder.nonModifierLineItemDetails();
        const expectedLineItemQuantity =
            item.pricingType === 'PER_POUND' ? item.weight : item.count;

        expect(nonModifierLineItemDetails).to.have.property('soldItemType').equal('ServicePrices');
        expect(nonModifierLineItemDetails)
            .to.have.property('lineItemName')
            .equal(item.lineItemName);
        expect(nonModifierLineItemDetails).to.have.property('lineItemUnitCost').equal(item.price);
        expect(nonModifierLineItemDetails)
            .to.have.property('lineItemDescription')
            .equal(item.description);
        expect(nonModifierLineItemDetails)
            .to.have.property('lineItemQuantity')
            .equal(expectedLineItemQuantity);
        expect(nonModifierLineItemDetails).to.have.property('lineItemTotalCost').equal(itemPrice);
        expect(nonModifierLineItemDetails).to.have.property('soldItemId').equal(item.priceId);
        expect(nonModifierLineItemDetails)
            .to.have.property('lineItemMinPrice')
            .equal(item.hasMinPrice ? item.minimimPrice : null);
        expect(nonModifierLineItemDetails)
            .to.have.property('lineItemMinQuantity')
            .equal(item.hasMinPrice ? item.minimumQuantity : null);
        expect(nonModifierLineItemDetails)
            .to.have.property('customerName')
            .equal(customerDetails.customerName);
        expect(nonModifierLineItemDetails)
            .to.have.property('customerPhoneNumber')
            .equal(customerDetails.customerPhoneNumber);
        expect(nonModifierLineItemDetails)
            .to.have.property('pricingType')
            .equal(item.servicePricingStructureType);
        expect(nonModifierLineItemDetails)
            .to.have.property('serviceCategoryType')
            .equal(item.serviceCategoryType);
        expect(nonModifierLineItemDetails).to.have.property('modifierLineItems');
        expect(nonModifierLineItemDetails.modifierLineItems.length).to.equal(1);
        expect(nonModifierLineItemDetails.modifierLineItems[0].modifierId).to.equal(modifier.id);
        expect(nonModifierLineItemDetails.modifierLineItems[0].modifierName).to.equal(
            modifier.name,
        );
        expect(nonModifierLineItemDetails.modifierLineItems[0].unitCost).to.equal(modifier.price);
        expect(nonModifierLineItemDetails.modifierLineItems[0].quantity).to.equal(
            expectedLineItemQuantity,
        );
        expect(nonModifierLineItemDetails.modifierLineItems[0].totalCost).to.equal(
            Number(expectedLineItemQuantity * modifier.price),
        );
        expect(nonModifierLineItemDetails.modifierLineItems[0].modifierPricingType).to.equal(
            modifier.pricingType,
        );
        expect(nonModifierLineItemDetails.modifierLineItems[0].modifierVersionId).to.equal(
            modifier.latestModifierVersion,
        );
    });

    it('buildItemAttributes should return the status and the price for the newItem', async () => {
        const baseItemBuilder = new BaseItemBuilder(item, customerDetails, 'SUBMITTED');

        // using class method here because we have tests for this above
        const itemPrice = baseItemBuilder.itemPrice();

        baseItemBuilder.buildItemAttributes();

        expect(baseItemBuilder.newItem.status).to.equal('SUBMITTED');
        expect(baseItemBuilder.newItem.price).to.equal(itemPrice);
    });

    it('isPerPound should return true if servicePricingStructureType is PER_POUND', async () => {
        item.servicePricingStructureType = 'PER_POUND';

        const baseItemBuilder = new BaseItemBuilder(item, customerDetails, 'SUBMITTED');
        const isPerPound = baseItemBuilder.isPerPound();

        expect(isPerPound).to.be.true;
    });

    it('isPerPound should return false if servicePricingStructureType is FIXED_PRICE', async () => {
        item.servicePricingStructureType = 'FIXED_PRICE';

        const baseItemBuilder = new BaseItemBuilder(item, customerDetails, 'SUBMITTED');
        const isPerPound = baseItemBuilder.isPerPound();

        expect(isPerPound).to.be.false;
    });

    it('mapServiceReferenceItemDetailModifiers should return an array of formatted modifier data', async () => {
        const modifierOne = await factory.create(FACTORIES_NAMES.modifier, {
            businessId: business.id,
            name: 'Oxygen Brightener',
            price: Number(0.15),
        });
        const modifierTwo = await factory.create(FACTORIES_NAMES.modifier, {
            businessId: business.id,
            name: 'Lavender Spritz',
            price: Number(0.15),
        });
        item.modifiers = [
            {
                price: modifierOne.price,
                name: modifierOne.name,
                description: modifierOne.descrition,
                modifierId: modifierOne.id,
                modifierPricingType: modifierOne.pricingType,
                latestModifierVersion: modifierOne.latestModifierVersion,
            },
            {
                price: modifierTwo.price,
                name: modifierTwo.name,
                description: modifierTwo.descrition,
                modifierId: modifierTwo.id,
                modifierPricingType: modifierTwo.pricingType,
                latestModifierVersion: modifierTwo.latestModifierVersion,
            },
        ];

        const baseItemBuilder = new BaseItemBuilder(item, customerDetails, 'SUBMITTED');
        const result = baseItemBuilder.mapServiceReferenceItemDetailModifiers();

        expect(result.length).to.equal(2);

        const firstModifierResult = result.find((item) => item.modifierId === modifierOne.id);
        expect(firstModifierResult.modifierId).to.equal(modifierOne.id);
        expect(firstModifierResult.modifierName).to.equal(modifierOne.name);
        expect(firstModifierResult.unitCost).to.equal(modifierOne.price);
        expect(firstModifierResult.quantity).to.equal(item.count);
        expect(firstModifierResult.totalCost).to.equal(Number(modifierOne.price * item.count));
        expect(firstModifierResult.modifierPricingType).to.equal(modifierOne.pricingType);
        expect(firstModifierResult.modifierVersionId).to.equal(modifierOne.latestModifierVersion);

        const secondModifierResult = result.find((item) => item.modifierId === modifierTwo.id);
        expect(secondModifierResult.modifierId).to.equal(modifierTwo.id);
        expect(secondModifierResult.modifierName).to.equal(modifierTwo.name);
        expect(secondModifierResult.unitCost).to.equal(modifierTwo.price);
        expect(secondModifierResult.quantity).to.equal(item.count);
        expect(secondModifierResult.totalCost).to.equal(Number(modifierTwo.price * item.count));
        expect(secondModifierResult.modifierPricingType).to.equal(modifierTwo.pricingType);
        expect(secondModifierResult.modifierVersionId).to.equal(modifierTwo.latestModifierVersion);
    });
});

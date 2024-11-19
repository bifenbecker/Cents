require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { addModifiersToOrderItem } = require('../../../../uow/singleOrder/addModifiersToOrderItem');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

describe('test addModifiersToOrderItem function', () => {
    let store,
        serviceCategory,
        serviceModifier,
        secondServiceModifier,
        orderItem,
        modifiers;

    beforeEach(async () => {
        const business = await factory.create(FN.laundromatBusiness);
        store = await factory.create(FN.store, {
            businessId: business.id,
        });
        serviceCategory = await factory.create(FN.serviceCategory, {
            businessId: business.id,
        });
        const service = await factory.create(FN.serviceMaster, {
            serviceCategoryId: serviceCategory.id,
        });
        const secondService = await factory.create(FN.serviceMaster, {
            serviceCategoryId: serviceCategory.id,
        });
        const servicePrice = await factory.create(FN.servicePrice, {
            serviceId: service.id,
            storeId: store.id,
        });
        const secondServicePrice = await factory.create(FN.servicePrice, {
            serviceId: secondService.id,
            storeId: store.id,
        });
        const modifier = await factory.create(FN.modifier, {
            businessId: store.businessId,
        });
        const secondModifier = await factory.create(FN.modifier, {
            businessId: business.id,
        });
        serviceModifier = await factory.create(FN.serviceModifier, {
            modifierId: modifier.id,
            serviceId: service.id,
        });
        secondServiceModifier = await factory.create(FN.serviceModifier, {
            modifierId: secondModifier.id,
            serviceId: secondService.id,
        });
        orderItem = {
            soldItemType: 'ServicePrices',
            servicePriceId: servicePrice.id,
        };
        modifiers = [
            {
                serviceModifierId: serviceModifier.id,
            },
            {
                serviceModifierId: secondServiceModifier.id,
            },
        ];
    });

    it('should return an empty array if soldItemType is not ServicePrices', async () => {
        const wrongOrderItem = {
            soldItemType: 'InventoryItem',
        };
        const result = await addModifiersToOrderItem(wrongOrderItem, []);
        expect(result).to.be.empty;
    });

    it('should return final modifiers list to include for the individual orderItem', async () => {
        const result = await addModifiersToOrderItem(orderItem, modifiers);
        expect(result).to.not.be.undefined;
        expect(result.length).to.eq(1);
        expect(result[0].serviceModifierId).to.equal(serviceModifier.id);
        expect(result[0].serviceModifierId).to.not.equal(secondServiceModifier.id);
    });

    it('should return an empty array if the orderItems are not associated with modifiers passed in ', async () => {
        const newService = await factory.create(FN.serviceMaster, {
            serviceCategoryId: serviceCategory.id,
        });
        const newServicePrice = await factory.create(FN.servicePrice, {
            serviceId: newService.id,
            storeId: store.id,
        });
        const newOrderItem = {
            soldItemType: 'ServicePrices',
            servicePriceId: newServicePrice.id,
        };
        const result = await addModifiersToOrderItem(newOrderItem, modifiers);
        expect(result).to.not.be.undefined;
        expect(result).to.be.empty;
    });
});

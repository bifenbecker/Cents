require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const {
    getFeaturedModifiers,
    getModifiers,
} = require('../../../../../services/washServices/modifiers/queries');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test modifier service queries', () => {
    describe('test getFeaturedModifiers', () => {
        let store, serviceMaster, serviceOrder, serviceModifier, serviceOrderItem;

        beforeEach(async () => {
            store = await factory.create('store');
            serviceOrder = await factory.create('serviceOrder', {
                storeId: store.id,
            });
            serviceMaster = await factory.create('serviceMaster');
            serviceModifier = await factory.create('serviceModifier', {
                serviceId: serviceMaster.id,
            });
            serviceOrderItem = await factory.create('serviceOrderItem', {
                orderId: serviceOrder.id,
            });
        });

        it('should return featured ServiceModifier', async () => {
            const featuredModifier = await getFeaturedModifiers(serviceMaster.id, serviceOrder.id);

            expect(featuredModifier).to.not.be.empty;
            expect(featuredModifier[0])
                .to.have.property('serviceModifierId')
                .to.equal(serviceModifier.id);
        });

        it('should return ServiceModifier with customerSelection true', async () => {
            const anotherServiceOrder = await factory.create('serviceOrder', {
                storeId: store.id,
            });
            const anotherServiceOrderItem = await factory.create('serviceOrderItem', {
                orderId: anotherServiceOrder.id,
                customerSelection: true,
            });
            await factory.create('serviceReferenceItem', {
                orderItemId: anotherServiceOrderItem.id,
                serviceId: serviceMaster.id,
                serviceModifierId: serviceModifier.id,
            });
            const featuredModifier = await getFeaturedModifiers(
                serviceMaster.id,
                anotherServiceOrder.id,
            );

            expect(featuredModifier).to.not.be.empty;
            expect(featuredModifier[0])
                .to.have.property('serviceModifierId')
                .to.equal(serviceModifier.id);
            expect(featuredModifier[0]).to.have.property('customerSelection').to.be.true;
        });

        it(`should return empty array when ServiceModifier doesn't exist with given serviceId`, async () => {
            const anotherServiceMaster = await factory.create('serviceMaster');
            const anotherServiceOrderItem = await factory.create('serviceOrderItem');
            const featuredModifier = await getFeaturedModifiers(
                anotherServiceMaster.id,
                serviceOrder.id,
            );

            expect(featuredModifier).to.be.empty;
        });

        it('should return featured ServiceModifier when orderId not passed', async () => {
            const featuredModifier = await getFeaturedModifiers(serviceMaster.id);

            expect(featuredModifier).to.not.be.empty;
            expect(featuredModifier[0])
                .to.have.property('serviceModifierId')
                .to.equal(serviceModifier.id);
        });
    });

    describe('test getModifiers', () => {
        let business,
            serviceCategory,
            service,
            modifierOne,
            modifierTwo,
            serviceModifierOne,
            serviceModifierTwo;

        beforeEach(async () => {
            business = await factory.create(FN.laundromatBusiness);
            serviceCategory = await factory.create(FN.serviceCategory, {
                businessId: business.id,
            });
            service = await factory.create(FN.serviceMaster);
            const modifierOneEntities = await factory.create(FN.modifierAndModifierVersion, {
                businessId: business.id,
                name: 'Oxygen Brightener',
                price: Number(0.15),
            });
            modifierOne = modifierOneEntities.modifier;

            const modifierTwoEntities = await factory.create(FN.modifierAndModifierVersion, {
                businessId: business.id,
                name: 'Lavender Spritz',
                price: Number(0.25),
            });
            modifierTwo = modifierTwoEntities.modifier;

            serviceModifierOne = await factory.create(FN.serviceModifier, {
                serviceId: service.id,
                modifierId: modifierOne.id,
            });
            serviceModifierTwo = await factory.create(FN.serviceModifier, {
                serviceId: service.id,
                modifierId: modifierTwo.id,
            });
        });

        it('should return a formatted list of modifiers based on provided servieModifiers', async () => {
            const serviceModifierIds = [serviceModifierOne.id, serviceModifierTwo.id];
            const result = await getModifiers(serviceModifierIds);

            expect(result.length).to.equal(2);

            const firstModifierResult = result.find(
                (item) => item.serviceModifierId === serviceModifierOne.id,
            );
            expect(firstModifierResult.serviceModifierId).to.equal(serviceModifierOne.id);
            expect(firstModifierResult.price).to.equal(modifierOne.price);
            expect(firstModifierResult.name).to.equal(modifierOne.name);
            expect(firstModifierResult.description).to.equal(modifierOne.description);
            expect(firstModifierResult.modifierId).to.equal(modifierOne.id);
            expect(firstModifierResult.modifierPricingType).to.equal(modifierOne.pricingType);
            expect(firstModifierResult.minimumQuantity).to.equal(null);
            expect(firstModifierResult.minimumPrice).to.equal(null);
            expect(firstModifierResult.lineItemType).to.equal('MODIFIER');
            expect(firstModifierResult.hasMinPrice).to.be.false;
            expect(firstModifierResult.weight).to.equal(0);
            expect(firstModifierResult.latestModifierVersion).to.equal(
                modifierOne.latestModifierVersion,
            );

            const secondModifierResult = result.find(
                (item) => item.serviceModifierId === serviceModifierTwo.id,
            );
            expect(secondModifierResult.serviceModifierId).to.equal(serviceModifierTwo.id);
            expect(secondModifierResult.price).to.equal(modifierTwo.price);
            expect(secondModifierResult.name).to.equal(modifierTwo.name);
            expect(secondModifierResult.description).to.equal(modifierTwo.description);
            expect(secondModifierResult.modifierId).to.equal(modifierTwo.id);
            expect(secondModifierResult.modifierPricingType).to.equal(modifierTwo.pricingType);
            expect(secondModifierResult.minimumQuantity).to.equal(null);
            expect(secondModifierResult.minimumPrice).to.equal(null);
            expect(secondModifierResult.lineItemType).to.equal('MODIFIER');
            expect(secondModifierResult.hasMinPrice).to.be.false;
            expect(secondModifierResult.weight).to.equal(0);
            expect(secondModifierResult.latestModifierVersion).to.equal(
                modifierTwo.latestModifierVersion,
            );
        });
    });
});

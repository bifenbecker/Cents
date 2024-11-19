require('../../../testHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const deliverableServicePriceAndModifierUow = require('../../../../uow/order/deliverableServicePriceAndModifierUow');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { MAX_DB_INTEGER } = require('../../../constants/dbValues');
const ModifierVersion = require('../../../../models/modifierVersions');

describe('test deliverableServicePriceAndModifierUow UoW', () => {
    describe('should return valid payload', () => {
        let entities = {};

        beforeEach(async () => {
            entities = await createUserWithBusinessAndCustomerOrders();
            entities.servicePrice = await factory.create(FN.servicePrice, {
                storeId: entities.store.id,
                isDeliverable: true,
            });
        });

        it('without serviceModifierIds', async () => {
            const { servicePrice, store } = entities;

            // call Uow
            const newPayload = await deliverableServicePriceAndModifierUow({
                storeId: store.id,
                serviceModifierIds: [],
                servicePriceId: servicePrice.id,
            });

            // assert
            expect(newPayload).to.have.property('orderItems');
            expect(newPayload.orderItems).to.have.lengthOf(1);
            expect(newPayload.orderItems[0].priceId).equals(servicePrice.id);
        });

        it('with serviceModifierIds', async () => {
            const firstServiceModifier = await factory.create(FN.serviceModifier, {
                serviceId: entities.servicePrice.serviceId,
            });
            const secondServiceModifier = await factory.create(FN.serviceModifier, {
                serviceId: entities.servicePrice.serviceId,
            });
            const { servicePrice, store } = entities;

            // call Uow
            const newPayload = await deliverableServicePriceAndModifierUow({
                storeId: store.id,
                serviceModifierIds: [firstServiceModifier.id, secondServiceModifier.id],
                servicePriceId: servicePrice.id,
            });

            // assert
            expect(newPayload).to.have.property('orderItems');
            expect(
                newPayload.orderItems,
                'should include servicePrice and 2 serviceModifiers',
            ).to.have.lengthOf(3);

            const foundService = newPayload.orderItems.find(
                (item) => item.priceId === servicePrice.id,
            );
            expect(foundService.priceId, 'should include correct servicePrice').equals(
                servicePrice.id,
            );
            const firstServiceModifierRes = newPayload.orderItems.find(
                (item) => item.serviceModifierId === firstServiceModifier.id,
            );
            expect(!!firstServiceModifierRes, 'should include correct first serviceModifierId').to
                .be.true;
            expect(firstServiceModifierRes).to.have.property('latestModifierVersion');
            const secondServiceModifierRes = newPayload.orderItems.find(
                (item) => item.serviceModifierId === secondServiceModifier.id,
            );
            expect(!!secondServiceModifierRes, 'should include correct second serviceModifierId').to
                .be.true;
            expect(secondServiceModifierRes).to.have.property('latestModifierVersion');

            const serviceModifiers = foundService.modifiers;
            expect(serviceModifiers[0]).to.have.property('latestModifierVersion');
            expect(serviceModifiers[1]).to.have.property('latestModifierVersion');

            // modifierVersion entries should have been created
            const firstModifierVersion = await ModifierVersion.query().findById(
                serviceModifiers[0].latestModifierVersion,
            );
            expect(!!firstModifierVersion, 'should have created first modifier version').to.be.true;
            // firstModifierVersion should be associated with the correct modifier
            expect(firstModifierVersion.modifierId).equals(serviceModifiers[0].modifierId);

            const secondModifierVersion = await ModifierVersion.query().findById(
                serviceModifiers[1].latestModifierVersion,
            );
            expect(!!secondModifierVersion, 'should have created second modifier version').to.be
                .true;
            // secondModifierVersion should be associated with the correct modifier
            expect(secondModifierVersion.modifierId).equals(serviceModifiers[1].modifierId);
        });
    });

    describe('should throw Error', () => {
        it('with invalid servicePriceId', async () => {
            await expect(
                deliverableServicePriceAndModifierUow({
                    servicePriceId: MAX_DB_INTEGER,
                }),
            ).to.be.rejectedWith('Service not found.');
        });

        it('with invalid servicePrice.storeId & not existing servicePrice.pricingTierId', async () => {
            const { store } = await createUserWithBusinessAndCustomerOrders();
            const servicePrice = await factory.create(FN.servicePrice, {
                storeId: store.id,
                isDeliverable: true,
                pricingTierId: null,
            });

            await expect(
                deliverableServicePriceAndModifierUow({
                    storeId: MAX_DB_INTEGER,
                    serviceModifierIds: [],
                    servicePriceId: servicePrice.id,
                }),
            ).to.be.rejectedWith('Service is not available for the selected store.');
        });

        it('with unDeliverable servicePrice', async () => {
            const { store } = await createUserWithBusinessAndCustomerOrders();
            const servicePrice = await factory.create(FN.servicePrice, {
                storeId: store.id,
                isDeliverable: false,
            });

            await expect(
                deliverableServicePriceAndModifierUow({
                    storeId: store.id,
                    serviceModifierIds: [],
                    servicePriceId: servicePrice.id,
                }),
            ).to.be.rejectedWith('Service is not available for the selected store.');
        });

        it('with invalid modifier id(s)', async () => {
            const { store } = await createUserWithBusinessAndCustomerOrders();
            const servicePrice = await factory.create(FN.servicePrice, {
                storeId: store.id,
                isDeliverable: true,
            });
            const serviceModifier = await factory.create(FN.serviceModifier, {
                serviceId: servicePrice.serviceId,
            });

            await expect(
                deliverableServicePriceAndModifierUow({
                    storeId: store.id,
                    serviceModifierIds: [serviceModifier.id, MAX_DB_INTEGER],
                    servicePriceId: servicePrice.id,
                }),
            ).to.be.rejectedWith('Invalid modifier id(s).');
        });
    });

    describe('Dry Cleaning tests', () => {
        let servicePrice;
        let serviceModifier;
        let payload;

        beforeEach(async () => {
            const business = await factory.create(FN.laundromatBusiness);
            const store = await factory.create(FN.store, { businessId: business.id });
            const service = await factory.create(FN.serviceMaster);
            servicePrice = await factory.create(FN.servicePrice, {
                storeId: store.id,
                isDeliverable: true,
                serviceId: service.id,
            });
            const modifier = await factory.create(FN.modifier, {
                businessId: business.id,
            });
            serviceModifier = await factory.create(FN.serviceModifier, {
                modifierId: modifier.id,
                serviceId: service.id,
            });
            payload = {
                serviceModifierIds: [serviceModifier.id],
                storeId: store.id,
            };
        });

        it('should not retrieve a list of services if servicePriceId is not included', async () => {
            const result = await deliverableServicePriceAndModifierUow(payload);
            expect(result.orderItems).to.deep.equal([]);
        });

        it('should retrieve a list of services and format them into orderItems', async () => {
            payload.servicePriceId = servicePrice.id;
            const result = await deliverableServicePriceAndModifierUow(payload);
            const modifierObject = result.orderItems.find(
                (item) => item.lineItemType === 'MODIFIER',
            );
            const serviceObject = result.orderItems.find((item) => item.lineItemType === 'SERVICE');
            expect(modifierObject.serviceModifierId).to.equal(serviceModifier.id);
            expect(serviceObject.priceId).to.equal(servicePrice.id);
        });

        it('should retrieve a list of services and format them into orderItems', async () => {
            payload.servicePriceId = servicePrice.id;
            const result = await deliverableServicePriceAndModifierUow(payload);
            const modifierObject = result.orderItems.find(
                (item) => item.lineItemType === 'MODIFIER',
            );
            const serviceObject = result.orderItems.find((item) => item.lineItemType === 'SERVICE');
            expect(modifierObject.serviceModifierId).to.equal(serviceModifier.id);
            expect(serviceObject.priceId).to.equal(servicePrice.id);
            expect(serviceObject.modifiers).to.be.an('array');
        });
    });
});

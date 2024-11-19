require('../../../testHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const createServiceOrderItems = require('../../../../uow/order/createServiceOrderItems');
const ServiceOrderItem = require('../../../../models/serviceOrderItem');
const { pricingStructureTypes } = require('../../../../constants/constants');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

describe('test createServiceOrderItems UoW', () => {
    describe('should return valid payload', () => {
        const status = 'READY_FOR_PICKUP';

        const defaultAssert = ({
            newPayload,
            totalPrice,
            orderItems,
            firstLineItemName,
            price,
            weightOrCount,
            storeCustomer,
        }) => {
            const referenceItem = newPayload.serviceOrder.orderItems[0].referenceItems[0];

            expect(newPayload).to.have.property('itemsTotal', totalPrice);
            expect(newPayload.serviceOrder.orderItems).to.have.lengthOf(orderItems.length);
            expect(newPayload.serviceOrder.orderItems[0])
                .to.have.property('referenceItems')
                .to.have.lengthOf(1);
            expect(referenceItem)
                .to.have.property('lineItemDetail')
                .to.have.property('lineItemName', firstLineItemName);
            expect(referenceItem.lineItemDetail).to.have.property('lineItemUnitCost', price);
            expect(referenceItem.lineItemDetail).to.have.property(
                'lineItemQuantity',
                weightOrCount,
            );
            expect(referenceItem.lineItemDetail).to.have.property(
                'customerName',
                `${storeCustomer.firstName} ${storeCustomer.lastName}`,
            );
            expect(referenceItem.lineItemDetail).to.have.property(
                'customerPhoneNumber',
                storeCustomer.phoneNumber,
            );
        };

        describe('with PER_POUND pricing', async () => {
            const firstLineItemName = 'firstLineItemName';
            const firstLineItemDescription = 'firstLineItemDescription';
            const price = 10;
            const weight = 5;
            let entities;
            let servicePrice;
            let serviceOrder;

            beforeEach(async () => {
                entities = await createUserWithBusinessAndCustomerOrders();
                const { store, storeCustomer, user } = entities;
                const perPoundServiceCategory = await factory.create(FN.perPoundServiceCategory);
                const servicePricingStructure = await factory.create(FN.servicePricingStructure, {
                    type: pricingStructureTypes.PER_POUND,
                });
                const serviceMaster = await factory.create(FN.serviceMaster, {
                    serviceCategoryId: perPoundServiceCategory.id,
                    servicePricingStructureId: servicePricingStructure.id,
                });
                servicePrice = await factory.create(FN.servicePrice, {
                    serviceId: serviceMaster.id,
                    storeId: store.id,
                });
                serviceOrder = await factory.create(FN.serviceOrder, {
                    userId: user.id,
                    storeId: store.id,
                    storeCustomerId: storeCustomer.id,
                });
            });

            it('with minimal price', async () => {
                const { storeCustomer } = entities;
                const minimumQuantity = 2; // minimal weight
                const minimumPrice = 5;
                const serviceOrderItem = {
                    lineItemType: 'SERVICE',
                    servicePricingStructureType: 'PER_POUND',
                    price,
                    weight,
                    minimumQuantity,
                    minimumPrice,
                    hasMinPrice: true,
                    priceId: servicePrice.id,
                    serviceModifierId: null,
                    lineItemName: firstLineItemName,
                    description: firstLineItemDescription,
                };
                const orderItems = [serviceOrderItem, serviceOrderItem];
                const totalPrice =
                    (minimumPrice + (weight - minimumQuantity) * price) * orderItems.length;
                const payload = {
                    orderItems,
                    serviceOrder,
                    status,
                    storeCustomer,
                };

                // call Uow
                const newPayload = await createServiceOrderItems(payload);

                // assert
                defaultAssert({
                    newPayload,
                    totalPrice,
                    orderItems,
                    firstLineItemName,
                    price,
                    weightOrCount: weight,
                    storeCustomer,
                });
                expect(newPayload.serviceOrder.orderItems[0].referenceItems[0])
                    .to.have.property('lineItemDetail')
                    .to.have.property('lineItemMinPrice', minimumPrice);
                expect(newPayload.serviceOrder.orderItems[0].referenceItems[0])
                    .to.have.property('lineItemDetail')
                    .to.have.property('lineItemMinQuantity', minimumQuantity);
            });

            it('without minimal price', async () => {
                const { storeCustomer } = entities;
                const serviceOrderItem = {
                    lineItemType: 'SERVICE',
                    servicePricingStructureType: 'PER_POUND',
                    price,
                    weight,
                    hasMinPrice: false,
                    priceId: servicePrice.id,
                    serviceModifierId: null,
                    lineItemName: firstLineItemName,
                    description: firstLineItemDescription,
                };
                const orderItems = [serviceOrderItem, serviceOrderItem];
                const totalPrice = price * weight * orderItems.length;
                const payload = {
                    orderItems,
                    serviceOrder,
                    status,
                    storeCustomer,
                };

                // call Uow
                const newPayload = await createServiceOrderItems(payload);

                // assert
                defaultAssert({
                    newPayload,
                    totalPrice,
                    orderItems,
                    firstLineItemName,
                    price,
                    weightOrCount: weight,
                    storeCustomer,
                });
                expect(newPayload.serviceOrder.orderItems[0].referenceItems[0])
                    .to.have.property('lineItemDetail')
                    .to.have.property('lineItemMinPrice', null);
                expect(newPayload.serviceOrder.orderItems[0].referenceItems[0])
                    .to.have.property('lineItemDetail')
                    .to.have.property('lineItemMinQuantity', null);
            });
        });

        it('with FIXED_PRICE pricing', async () => {
            const { store, storeCustomer, user } = await createUserWithBusinessAndCustomerOrders();
            const serviceCategory = await factory.create(FN.serviceCategory);
            const servicePricingStructure = await factory.create(FN.servicePricingStructure, {
                type: pricingStructureTypes.FIXED_PRICE,
            });
            const serviceMaster = await factory.create(FN.serviceMaster, {
                serviceCategoryId: serviceCategory.id,
                servicePricingStructureId: servicePricingStructure.id,
            });
            const servicePrice = await factory.create(FN.servicePrice, {
                serviceId: serviceMaster.id,
                storeId: store.id,
            });
            const serviceOrder = await factory.create(FN.serviceOrder, {
                userId: user.id,
                storeId: store.id,
                storeCustomerId: storeCustomer.id,
            });

            const firstLineItemName = 'firstLineItemName';
            const firstLineItemDescription = 'firstLineItemDescription';
            const price = 5;
            const count = 3;
            const serviceOrderItem = {
                lineItemType: 'SERVICE',
                servicePricingStructureType: 'FIXED_PRICE',
                price,
                count,
                hasMinPrice: false,
                priceId: servicePrice.id,
                serviceModifierId: null,
                lineItemName: firstLineItemName,
                description: firstLineItemDescription,
            };
            const orderItems = [serviceOrderItem, serviceOrderItem];
            const totalPrice = price * count * orderItems.length;
            const payload = {
                orderItems,
                serviceOrder,
                status,
                storeCustomer,
            };

            // call Uow
            const newPayload = await createServiceOrderItems(payload);

            // assert
            defaultAssert({
                newPayload,
                totalPrice,
                orderItems,
                firstLineItemName,
                price,
                weightOrCount: count,
                storeCustomer,
            });
            expect(newPayload.serviceOrder.orderItems[0].referenceItems[0])
                .to.have.property('lineItemDetail')
                .to.have.property('lineItemMinPrice', null);
            expect(newPayload.serviceOrder.orderItems[0].referenceItems[0])
                .to.have.property('lineItemDetail')
                .to.have.property('lineItemMinQuantity', null);
        });
    });

    describe('should throw Error', () => {
        it('without serviceOrder in payload', async () => {
            await expect(createServiceOrderItems({})).to.be.rejectedWith(
                "Cannot read property 'length' of undefined",
            );
        });
    });

    describe('Dry Cleaning tests', () => {
        let store;
        let serviceOrder;
        let payload;

        beforeEach(async () => {
            const business = await factory.create('laundromatBusiness');
            store = await factory.create('store', { businessId: business.id });
            const storeCustomer = await factory.create('storeCustomer', {
                storeId: store.id,
                businessId: business.id,
            });
            serviceOrder = await factory.create('serviceOrder', {
                storeId: store.id,
                storeCustomerId: storeCustomer.id,
            });
            payload = {
                serviceOrder,
                storeCustomer,
                status: 'SUBMITTED',
            };
        });

        it('should not create any ServiceOrderItem entries for the ServiceOrder', async () => {
            payload.orderItems = [];
            const result = await createServiceOrderItems(payload);
            expect(result.serviceOrder.orderItems).to.deep.equal([]);
            expect(result.itemsTotal).to.equal(0);
        });

        it('should retrieve a list of services and format them into orderItems', async () => {
            const service = await factory.create('serviceMaster');
            const servicePrice = await factory.create('servicePrice', {
                storeId: store.id,
                isDeliverable: true,
                serviceId: service.id,
            });
            payload.orderItems = [
                {
                    priceId: servicePrice.id,
                    price: servicePrice.storePrice,
                    storeId: store.id,
                    lineItemName: service.name,
                    hasMinPrice: !!servicePrice.minPrice,
                    minimumQuantity: servicePrice.minQuantity,
                    minimumPrice: servicePrice.minPrice,
                    isTaxable: servicePrice.isTaxable,
                    description: service.description,
                    servicePricingStructureType: 'FIXED_PRICE',
                    lineItemType: 'SERVICE',
                    serviceId: service.id,
                    weight: 0,
                    count: 1,
                    isDeliverable: servicePrice.isDeliverable,
                    pricingTierId: servicePrice.pricingTierId,
                },
            ];
            const result = await createServiceOrderItems(payload);
            const serviceOrderItems = await ServiceOrderItem.query().where({
                orderId: serviceOrder.id,
            });
            const specificServiceOrderItem = await ServiceOrderItem.query().findOne({
                orderId: serviceOrder.id,
            });
            expect(result.serviceOrder.orderItems.length).to.equal(serviceOrderItems.length);
            expect(result.serviceOrder.orderItems[0].orderId).to.equal(
                specificServiceOrderItem.orderId,
            );
            expect(result.serviceOrder.orderItems[0].price).to.equal(
                specificServiceOrderItem.price,
            );
            expect(result.serviceOrder.orderItems[0].status).to.equal(
                specificServiceOrderItem.status,
            );
        });
    });
});

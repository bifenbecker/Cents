require('../../../../../testHelper');
const { cloneDeep } = require('lodash');
const { expect, assert } = require('../../../../../support/chaiHelper');
const factory = require('../../../../../factories');
const createIntentCreatedDeliveryUow = require('../../../../../../uow/liveLink/serviceOrders/delivery/createIntentCreatedDeliveryUow');
const {
    orderDeliveryStatuses,
    ORDER_DELIVERY_TYPES,
    ORDER_TYPES,
    deliveryProviders,
    returnMethods,
} = require('../../../../../../constants/constants');
const { FACTORIES_NAMES: FN } = require('../../../../../constants/factoriesNames');

describe('test createIntentCreatedDeliveryUow UoW', () => {
    const initialProperty = 'initialProperty';

    it('should return initial payload if return method IN_STORE_PICKUP', async () => {
        const payload = {
            initialProperty,
            returnMethod: returnMethods.IN_STORE_PICKUP,
        };
        const initialPayload = cloneDeep(payload);

        // call UoW
        const newPayload = await createIntentCreatedDeliveryUow(payload);

        // assert
        assert.deepEqual(newPayload, initialPayload);
    });

    describe('should add new properties from createOrderDelivery UoW', () => {
        let payload;

        beforeEach(async () => {
            const store = await factory.create(FN.store);
            await factory.create(FN.ownDeliverySetting, {
                storeId: store.id,
                deliveryFeeInCents: 500,
                returnDeliveryFeeInCents: 400,
            });
            const centsCustomer = await factory.create(FN.centsCustomer);
            const storeCustomer = await factory.create(FN.storeCustomer, {
                centsCustomerId: centsCustomer.id,
                storeId: store.id,
                businessId: store.businessId,
            });
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                status: 'HUB_PROCESSING_COMPLETE',
            });
            const order = await factory.create(FN.serviceOrderMasterOrder, {
                orderableId: serviceOrder.id,
            });
            const address = await factory.create(FN.centsCustomerAddress, {
                centsCustomerId: centsCustomer.id,
            });

            const delivery = {
                status: orderDeliveryStatuses.SCHEDULED,
                orderId: order.id,
                postalCode: '10003',
                type: ORDER_DELIVERY_TYPES.RETURN,
                deliveryProvider: deliveryProviders.OWN_DRIVER,
            };

            payload = {
                store,
                order,
                orderType: ORDER_TYPES.ONLINE,
                storeCustomer,
                address,
                centsCustomerAddressId: address.id,
                orderDelivery: {
                    delivery,
                },
                initialProperty,
            };
        });

        it('with delivery by own driver', async () => {
            // call UoW
            const newPayload = await createIntentCreatedDeliveryUow(payload);

            // assert
            expect(newPayload).have.property('initialProperty', initialProperty);
            expect(newPayload)
                .have.property('intentCreatedDelivery')
                .have.property('thirdPartyDeliveryCostInCents', 0);
            expect(newPayload).have.property('orderDelivery').have.property('delivery');
            assert.deepEqual(newPayload.intentCreatedDelivery, newPayload.orderDelivery.delivery);
        });

        it('with delivery by DoorDash', async () => {
            const deliveryCost = 599;
            payload.orderDelivery.delivery.deliveryProvider = deliveryProviders.DOORDASH;
            payload.orderDelivery.delivery.thirdPartyDeliveryCostInCents = deliveryCost;

            // call UoW
            const newPayload = await createIntentCreatedDeliveryUow(payload);

            // assert
            expect(newPayload).have.property('initialProperty', initialProperty);
            expect(newPayload)
                .have.property('intentCreatedDelivery')
                .have.property('thirdPartyDeliveryCostInCents', deliveryCost);
            expect(newPayload).have.property('orderDelivery').have.property('delivery');
            assert.deepEqual(newPayload.intentCreatedDelivery, newPayload.orderDelivery.delivery);
        });
    });
});

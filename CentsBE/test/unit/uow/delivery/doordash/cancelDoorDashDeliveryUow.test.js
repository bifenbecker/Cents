require('../../../../testHelper');
const nock = require('nock');
const { cloneDeep } = require('lodash');
const { expect, assert } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const cancelDoorDashDeliveryUow = require('../../../../../uow/delivery/doordash/cancelDoorDashDeliveryUow');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { deliveryProviders } = require('../../../../../constants/constants');

describe('test cancelDoorDashDeliveryUoW', () => {
    const url = process.env.DOORDASH_API_URL;
    const initialProperty = 'initialProperty';
    let entities;

    beforeEach(async () => {
        entities = await createUserWithBusinessAndCustomerOrders();
    });

    afterEach(() => {
        nock.cleanAll();
    });

    describe('should return initial payload', () => {
        const createNock = (orderDelivery) => {
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.DOORDASH_API_KEY}`,
            };

            return nock(url, {
                reqheaders: headers,
            })
                .put(`/deliveries/${orderDelivery.thirdPartyDeliveryId}/cancel`)
                .reply(200, { data: 'data' });
        };

        describe('should not cancel DoorDash delivery', () => {
            const defaultAssert = (scope, initialPayload, newPayload) => {
                expect(scope.isDone(), 'should not call cancel DoorDash API').to.be.false;
                assert.deepEqual(newPayload, initialPayload, 'should not change payload');
            };

            it('when orderDelivery not provided and deliveryProvider is OWN_DRIVER', async () => {
                const { store, order, storeCustomer } = entities;
                const orderDelivery = await factory.create(FN.orderDelivery, {
                    orderId: order.id,
                    storeId: store.id,
                    storeCustomerId: storeCustomer.id,
                    deliveryProvider: deliveryProviders.OWN_DRIVER,
                    thirdPartyDeliveryId: 'doorDashId',
                });
                const payload = {
                    orderDeliveryId: orderDelivery.id,
                    orderDelivery: undefined,
                    initialProperty,
                };
                const initialPayload = cloneDeep(payload);
                const scope = createNock(orderDelivery);

                // call Uow
                const newPayload = await cancelDoorDashDeliveryUow(payload);

                // assert
                defaultAssert(scope, initialPayload, newPayload);
            });

            it('when orderDelivery is provided and deliveryProvider is OWN_DRIVER', async () => {
                const { store, order, storeCustomer } = entities;
                const orderDelivery = await factory.create(FN.orderDelivery, {
                    orderId: order.id,
                    storeId: store.id,
                    storeCustomerId: storeCustomer.id,
                    deliveryProvider: deliveryProviders.OWN_DRIVER,
                    thirdPartyDeliveryId: 'doorDashId',
                });
                const payload = { orderDelivery, initialProperty };
                const initialPayload = cloneDeep(payload);
                const scope = createNock(orderDelivery);

                // call Uow
                const newPayload = await cancelDoorDashDeliveryUow(payload);

                // assert
                defaultAssert(scope, initialPayload, newPayload);
            });

            it('when fromWebhook is true', async () => {
                const { store, order, storeCustomer } = entities;
                const orderDelivery = await factory.create(FN.orderDelivery, {
                    orderId: order.id,
                    storeId: store.id,
                    storeCustomerId: storeCustomer.id,
                    deliveryProvider: deliveryProviders.DOORDASH,
                    thirdPartyDeliveryId: 'doorDashId',
                });
                const payload = { orderDelivery, fromWebhook: true, initialProperty };
                const initialPayload = cloneDeep(payload);
                const scope = createNock(orderDelivery);

                // call Uow
                const newPayload = await cancelDoorDashDeliveryUow(payload);

                // assert
                defaultAssert(scope, initialPayload, newPayload);
            });
        });

        it('should cancel DoorDash delivery', async () => {
            const { store, order, storeCustomer } = entities;
            const orderDelivery = await factory.create(FN.orderDelivery, {
                orderId: order.id,
                storeId: store.id,
                storeCustomerId: storeCustomer.id,
                deliveryProvider: deliveryProviders.DOORDASH,
                thirdPartyDeliveryId: 'doorDashId',
            });
            const payload = { orderDelivery, initialProperty };
            const initialPayload = cloneDeep(payload);
            const scope = createNock(orderDelivery);

            // call Uow
            const newPayload = await cancelDoorDashDeliveryUow(payload);

            // assert
            expect(scope.isDone(), 'should call cancel DoorDash API').to.be.true;
            assert.deepEqual(newPayload, initialPayload, 'should not change payload');
        });
    });

    it('should throw Error in case of problems with DoorDash API', async () => {
        const doorDashError = 'doorDashError';
        const { store, order, storeCustomer } = entities;
        const orderDelivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            deliveryProvider: deliveryProviders.DOORDASH,
            thirdPartyDeliveryId: 'doorDashId',
        });
        const payload = { orderDelivery, initialProperty };
        const scope = nock(url)
            .put(`/deliveries/${orderDelivery.thirdPartyDeliveryId}/cancel`)
            .replyWithError(doorDashError);

        // assert
        await expect(cancelDoorDashDeliveryUow(payload)).to.be.rejectedWith(doorDashError);
        expect(scope.isDone(), 'should call cancel DoorDash API').to.be.true;
    });
});

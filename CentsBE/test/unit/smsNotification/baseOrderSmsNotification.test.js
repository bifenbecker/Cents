require('../../testHelper');
const factory = require('../../factories');
const BaseOrderSmsNotification = require('../../../smsNotification/baseOrderSmsNotification');
const constants = require('../../../constants/constants');
const sinon = require('sinon');
const twilio = require('../../../services/sms/twilio');
const axios = require('axios');

describe('test BaseOrderSmsNotification', () => {
    let createMessageStub, order, serviceOrder, storeCustomer;
    beforeEach(async () => {
        createMessageStub = sinon.stub(twilio.messages, 'create').returns({
            dateCreated: new Date(),
        });
        sinon.stub(axios, 'post').returns({ data: { link: 'https://example.com' } });

        const store = await factory.create('store');

        storeCustomer = await factory.create('storeCustomer', {
            storeId: store.id,
            businessId: store.businessId,
        });

        serviceOrder = await factory.create('serviceOrder', {
            status: 'SUBMITTED',
            storeId: store.id,
        });

        order = await factory.create('order', {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
    });

    describe('intentOrderPickupNotification()', () => {
        it('pickup is undefined', async () => {
            // arrange
            const baseOrderSmsNotification = new BaseOrderSmsNotification(
                serviceOrder,
                storeCustomer,
                constants.orderSmsEvents.INTENT_ORDER_PICKUP_NOTIFICATION,
            );

            // act
            await baseOrderSmsNotification.intentOrderPickupNotification();

            // assert
            sinon.assert.notCalled(createMessageStub);
        });
        it('own driver pickup', async () => {
            // arrange
            const baseOrderSmsNotification = new BaseOrderSmsNotification(
                serviceOrder,
                storeCustomer,
                constants.orderSmsEvents.INTENT_ORDER_PICKUP_NOTIFICATION,
            );

            await factory.create('orderDelivery', {
                status: 'SCHEDULED',
                orderId: order.id,
                storeId: serviceOrder.storeId,
                deliveryProvider: 'OWN_DRIVER',
                type: 'PICKUP',
            });

            // act
            await baseOrderSmsNotification.intentOrderPickupNotification();

            // assert
            sinon.assert.notCalled(createMessageStub);
        });
        it('doordash driver en route to pickup', async () => {
            // arrange
            const baseOrderSmsNotification = new BaseOrderSmsNotification(
                serviceOrder,
                storeCustomer,
                constants.orderSmsEvents.INTENT_ORDER_PICKUP_NOTIFICATION,
            );
            await factory.create('orderDelivery', {
                status: 'EN_ROUTE_TO_PICKUP',
                orderId: order.id,
                storeId: serviceOrder.storeId,
                deliveryProvider: 'DOORDASH',
                type: 'PICKUP',
            });

            // act
            await baseOrderSmsNotification.intentOrderPickupNotification();

            // assert
            sinon.assert.notCalled(createMessageStub);
        });
        it('should send sms message', async () => {
            // arrange
            const baseOrderSmsNotification = new BaseOrderSmsNotification(
                serviceOrder,
                storeCustomer,
                constants.orderSmsEvents.INTENT_ORDER_PICKUP_NOTIFICATION,
            );
            await factory.create('orderDelivery', {
                status: 'SCHEDULED',
                orderId: order.id,
                storeId: serviceOrder.storeId,
                deliveryProvider: 'DOORDASH',
                type: 'PICKUP',
            });

            // act
            await baseOrderSmsNotification.intentOrderPickupNotification();

            // assert
            sinon.assert.calledOnce(createMessageStub);
        });
    });
});

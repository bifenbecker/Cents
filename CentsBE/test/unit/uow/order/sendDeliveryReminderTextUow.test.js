require('../../../testHelper');
const { chai, expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const sendDeliveryReminderTextUow = require('../../../../uow/order/sendDeliveryReminderTextUow');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const eventEmitter = require('../../../../config/eventEmitter');

describe('test sendDeliveryReminderTextUow', () => {
    let store, serviceOrder;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder'
        });
        const timing = await factory.create(FN.timing);
        const orderDelivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
            timingsId: timing.id,
        });
        const orderNotificationLog = await factory.create(FN.serviceOrderNotificationLog, {
            orderId: serviceOrder.id,
        });
    });

    it('should return expected result', async () => {
        const payload = {
            serviceOrderId: serviceOrder.id,
            storeId: store.id,
        };
        const result = await sendDeliveryReminderTextUow(payload);
        expect(result.deliveryReminderText).should.exist;
        expect(result.deliveryReminderText).to.be.a('string');
    });

    it('should return result where hasSmsEnabled is false', async () => {
        const storeSettings = store.getStoreSettings();
        await storeSettings.update({
            hasSmsEnabled: false,
        }).execute();
        const payload = {
            serviceOrderId: serviceOrder.id,
            storeId: store.id,
        };
        await expect(sendDeliveryReminderTextUow(payload)).to.be.rejectedWith(
           'SMS is currently disabled for this store. Please reach out to Cents Support for additional help.'
        );
    });

    it('should dispatch orderSmsNotification event with orderSmsEvents and serviceOrderId', async () => {
        const spy = chai.spy(() => {});
        eventEmitter.once('orderSmsNotification', spy);
        const payload = {
            serviceOrderId: serviceOrder.id,
            storeId: store.id,
        };
        const result = await sendDeliveryReminderTextUow(payload);
        expect(result.deliveryReminderText).should.exist;
        expect(result.deliveryReminderText).to.be.a('string');
        expect(spy).to.have.been.called.with('orders.intentOrderDeliveryNotification', serviceOrder.id);
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(sendDeliveryReminderTextUow()).to.be.rejected;
        await expect(sendDeliveryReminderTextUow(null)).to.be.rejected;
        await expect(sendDeliveryReminderTextUow({})).to.be.rejected;
    });
});
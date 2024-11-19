require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const sendDeliveryReminderTextPipeline = require('../../../../../pipeline/employeeApp/serviceOrder/sendDeliveryReminderTextPipeline');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test sendDeliveryReminderTextPipeline', () => {
    let store, serviceOrder, order, timing, orderDelivery, orderNotificationLog;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder'
        });
        timing = await factory.create(FN.timing);
        orderDelivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
            timingsId: timing.id,
        });
        orderNotificationLog = await factory.create(FN.serviceOrderNotificationLog, {
            orderId: serviceOrder.id,
        });
    });

    it('should return expected result', async () => {
        const payload = {
            serviceOrderId: serviceOrder.id,
            storeId: store.id,
        };
       const result = await sendDeliveryReminderTextPipeline(payload);
       expect(result.deliveryReminderText).should.exist;
       expect(typeof result.deliveryReminderText).to.eq('string');
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(sendDeliveryReminderTextPipeline()).to.be.rejected;
        await expect(sendDeliveryReminderTextPipeline(null)).to.be.rejected;
        await expect(sendDeliveryReminderTextPipeline({})).to.be.rejected;
    });
});
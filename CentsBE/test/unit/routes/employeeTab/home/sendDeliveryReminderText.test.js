require('../../../../testHelper');
const sinon = require('sinon');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const sendDeliveryReminderText = require('../../../../../routes/employeeTab/home/sendDeliveryReminderText');

describe('test sendDeliveryReminderText', () => {
    it('should throw an error if serviceOrderId was not passed in params', async () => {
        const store = await factory.create(FN.store);
        const req = {
            params: {
                serviceOrderId: undefined,
            },
            currentStore: store,
        };
        const res = {
            status: () => ({
                json: () => {},
            }),
        };
        const next = (e) => {
            return new Error(e);
        };
        const spy = sinon.spy(res, "status");
        expect(await sendDeliveryReminderText(req, res, next)).to.be.undefined;
        sinon.assert.calledWith(spy, 422);
    });

    it('should send delivery reminder text successfully', async () => {
        const store = await factory.create(FN.store);
        const timing = await factory.create(FN.timing);
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        const orderNotificationLog = await factory.create(FN.serviceOrderNotificationLog, {
            orderId: serviceOrder.id,
        });
        const order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        const orderDelivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
            timingsId: timing.id,
        });
        const req = {
            params: {
                serviceOrderId: serviceOrder.id,
            },
            currentStore: store,
        };
        const res = {
            status: () => ({
                json: () => {},
            }),
        };
        const next = (e) => {
            return new Error(e);
        };
        const spyStatus = sinon.spy(res, "status");
        const result = await sendDeliveryReminderText(req, res, next);
        sinon.assert.calledWith(spyStatus, 200);
    });
});
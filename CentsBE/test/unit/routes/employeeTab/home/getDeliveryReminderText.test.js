require('../../../../testHelper');
const momenttz = require('moment-timezone');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const getDeliveryReminderText = require('../../../../../routes/employeeTab/home/getDeliveryReminderText');

describe('test getDeliveryReminderText', () => {
    let settings, store, timing, serviceOrder, order;

    beforeEach(async () => {
        settings = await factory.build(FN.storeSetting);
        store = await factory.build(FN.store, {
            settings,
        });
        timing = await factory.build(FN.timing);
        serviceOrder = await factory.build(FN.serviceOrder, {
            storeId: store.id,
        });
        order = await factory.build(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
    });

    it('should return an empty string', async () => {
        const orderNotificationLog = await factory.build(FN.serviceOrderNotificationLog, {
            orderId: serviceOrder.id,
        });
        const delivery = await factory.build(FN.orderDelivery, {
            orderId: order.id,
            timingsId: timing.id,
            timing,
        });
        const orderObj = {
            store,
            orderMaster: { delivery },
            status: '123',
            orderType: '123',
            createdAt: new Date(),
            notificationLogs: orderNotificationLog,
        };
        expect(getDeliveryReminderText(orderObj)).to.eq('');
    });

    it('should get delivery reminder text successfully', async () => {
        let notificationLogs = [];
        notificationLogs.push(await factory.build(FN.serviceOrderNotificationLog, {
            orderId: serviceOrder.id,
        }));
        const delivery = await factory.build(FN.orderDelivery, {
            orderId: order.id,
            timingsId: timing.id,
            timing,
        });
        const orderObj = {
            store,
            orderMaster: { delivery },
            status: 'READY_FOR_DRIVER_PICKUP',
            orderType: '123',
            createdAt: new Date(),
            notificationLogs,
        };
        const time = momenttz(Number(delivery.deliveryWindow[0])).tz(settings.timeZone);
        expect(getDeliveryReminderText(orderObj)).to.eq(`Sending at 7:00 PM on ${time.subtract(1, 'day').format('MMMM Do')}`);
    });

    it('should get delivery reminder text successfully when notifiedAt > deliveryTime', async () => {
        let notificationLogs = [];
        notificationLogs.push(await factory.build(FN.serviceOrderNotificationLog, {
            orderId: serviceOrder.id,
            eventName: 'orders.intentOrderDeliveryNotification',
            notifiedAt: new Date(),
        }));
        const delivery = await factory.build(FN.orderDelivery, {
            deliveryWindow: [ momenttz().add(-3, 'd').valueOf(), momenttz().add(-3, 'd').valueOf() ],
            orderId: order.id,
            timingsId: timing.id,
            timing,
        });
        const orderObj = {
            store,
            orderMaster: { delivery },
            status: 'HUB_PROCESSING_COMPLETE',
            orderType: 'RESIDENTIAL',
            createdAt: new Date(),
            notificationLogs,
        };
        const notifiedAt = momenttz(notificationLogs[0].notifiedAt).tz(settings.timeZone);
        expect(getDeliveryReminderText(orderObj)).to.eq(`Sent at ${notifiedAt.format('h:mm A')} on ${notifiedAt.format('MMMM Do')}`);
    });

    it('should get delivery reminder text successfully when notifiedAt < deliveryTime', async () => {
        let notificationLogs = [];
        notificationLogs.push(await factory.build(FN.serviceOrderNotificationLog, {
            orderId: serviceOrder.id,
            eventName: 'orders.intentOrderDeliveryNotification',
            notifiedAt: new Date(),
        }));
        const delivery = await factory.build(FN.orderDelivery, {
            orderId: order.id,
            timingsId: timing.id,
            timing,
        });
        const orderObj = {
            store,
            orderMaster: { delivery },
            status: 'HUB_PROCESSING_COMPLETE',
            orderType: 'RESIDENTIAL',
            createdAt: new Date(),
            notificationLogs,
        };
        const notifiedAt = momenttz(notificationLogs[0].notifiedAt).tz(settings.timeZone);
        expect(getDeliveryReminderText(orderObj)).to.eq(`Sent at 7:00 PM on ${notifiedAt.format('MMMM Do')}`);
    });

    it('should get delivery reminder text successfully when deliveryStartHour more than 19', async () => {
        let notificationLogs = [];
        notificationLogs.push(await factory.build(FN.serviceOrderNotificationLog, {
            orderId: serviceOrder.id,
            notifiedAt: new Date(),
        }));
        const delivery = await factory.build(FN.orderDelivery, {
            deliveryWindow: [ new Date('2022-06-08T03:00:00.819Z'), new Date('2022-06-08T03:00:00.819Z') ],
            orderId: order.id,
            timingsId: timing.id,
            timing,
        });
        const orderObj = {
            store,
            orderMaster: { delivery },
            status: 'HUB_PROCESSING_COMPLETE',
            orderType: 'RESIDENTIAL',
            createdAt: new Date('2022-06-08T03:00:00.819Z'),
            notificationLogs,
        };
        expect(getDeliveryReminderText(orderObj)).to.eq(`Sending at 7:00 PM on June 7th`);
    });

    it('should get delivery reminder text successfully when deliveryStartHour less than 19', async () => {
        let notificationLogs = [];
        notificationLogs.push(await factory.build(FN.serviceOrderNotificationLog, {
            orderId: serviceOrder.id,
            notifiedAt: new Date(),
        }));
        const delivery = await factory.build(FN.orderDelivery, {
            deliveryWindow: [ new Date('2022-06-08T01:00:00.819Z'), new Date('2022-06-08T01:00:00.819Z') ],
            orderId: order.id,
            timingsId: timing.id,
            timing,
        });
        const orderObj = {
            store,
            orderMaster: { delivery },
            status: 'HUB_PROCESSING_COMPLETE',
            orderType: 'RESIDENTIAL',
            createdAt: new Date('2022-06-08T01:00:00.819Z'),
            notificationLogs,
        };
        expect(getDeliveryReminderText(orderObj)).to.eq('');
    });
});
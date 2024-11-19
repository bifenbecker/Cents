const sinon = require('sinon');
const axios = require('axios');
const moment = require('moment');
const { currency, formatDateWithTimezone } = require('../../../../lib/helpers');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const StoreSettings = require('../../../../models/storeSettings');
const { 
  ORDERABLE_TYPES, 
  statuses,
  orderDeliveryStatuses,
  PAYMENT_INTENT_STATUSES,
  ORDER_TYPES,
  ORDER_DELIVERY_TYPES,
} = require('../../../../constants/constants');
const { DATE_FORMATS } = require('../../../../lib/constants');
const { sendDailyDigestEmail } = require('../../../../services/email/dailyDigestEmail');
const logger = require('../../../../lib/logger');
const { copyMomentDate } = require('../../../support/dateTimeHelper');

const DATE_FORMAT = 'YYYY-MM-DD';
const UNIX_DATE_TIME_STR_10_00 = "1970-01-01T10:00:00.000Z";
const UNIX_DATE_TIME_STR_23_30 = "1970-01-01T23:30:00.000Z";

describe('test daily digest email', () => {
    let store, business, axiosPostspy, axiosCreateSpy, today, yesterday, timeZone;

    beforeEach(async () => {
        axiosPostspy = sinon.spy();
        axiosCreateSpy = sinon.stub(axios, 'create').returns({ post: axiosPostspy });

        const user = await factory.create(FN.user);
        
        business = await factory.create(FN.laundromatBusiness, {
          userId: user.id
        });

        store = await factory.create(FN.store, {
            businessId: business.id,
        });

        const otherUser = await factory.create(FN.user);

        const otherBusiness = await factory.create(FN.laundromatBusiness, {
            userId: otherUser.id
        });

        await factory.create(FN.store, {
            businessId: otherBusiness.id,
        });

        await factory.create(FN.store, {
            businessId: otherBusiness.id,
        });

        await factory.create(FN.store, {
            businessId: otherBusiness.id,
        });

        const storeSettings = await StoreSettings.query()
            .where('storeId', store.id)
            .patch({
                timeZone: DATE_FORMATS.BUSINESS_TIMEZONE,
            })
            .returning('*');

        timeZone = storeSettings[0].timeZone;

        today = moment().tz(timeZone).format(DATE_FORMAT);
        yesterday = moment(today).subtract(1, 'd').format(DATE_FORMAT);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should not send daily digest', async () => {
        today = moment.tz('2022-06-16', timeZone).format(DATE_FORMAT);
        yesterday = moment(today).subtract(1, 'd').format(DATE_FORMAT);
        const loggerInfoSpy = sinon.spy(logger, 'info');
        const result = await sendDailyDigestEmail(today, yesterday);

        expect(loggerInfoSpy.called).to.be.true;
        expect(axiosCreateSpy.called).to.be.false;
        expect(result).to.be.true;
    });

    it('should send daily digest with orders due today', async () => {
        const serviceOrders = [];
        const turnAroundInHoursList = [0, 24, 48];

        for (const turnAroundInHours of turnAroundInHoursList) {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                turnAroundInHours,
                storeId: store.id,
                status: statuses.PROCESSING,
                placedAt: moment().tz(timeZone).format(),
            });

            serviceOrders.push(serviceOrder);
        }

        await sendDailyDigestEmail(today, yesterday);

        const [target, mail] = axiosPostspy.getCall(0).args;
        
        expect(axiosPostspy.calledOnce).to.be.true;
        expect(target).to.equal('/mail/send');
        expect(mail.personalizations).to.have.lengthOf(1);
        expect(mail.personalizations[0].dynamic_template_data.id).to.equal(business.id);
        expect(mail.personalizations[0].dynamic_template_data.reportDate).to.equal(formatDateWithTimezone(today));
        expect(mail.personalizations[0].dynamic_template_data.ordersCountDueToday).to.equal('1');
    });

    it('should send daily digest with pounds due today', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            turnAroundInHours: 0,
            storeId: store.id,
            status: statuses.PROCESSING,
            placedAt: moment().tz(timeZone).format(),
        });

        const serviceOrderWeight = await factory.create(FN.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
            step: 1,
            totalWeight: 5,
            chargeableWeight: 5,
        });

        await sendDailyDigestEmail(today, yesterday);

        const [, mail] = axiosPostspy.getCall(0).args;
        
        expect(mail.personalizations).to.have.lengthOf(1);
        expect(mail.personalizations[0].dynamic_template_data.ordersCountDueToday).to.equal('1');
        expect(mail.personalizations[0].dynamic_template_data.poundsDueToday).to.equal(`${serviceOrderWeight.chargeableWeight}.00`);
    });

    it('should send daily digest with orders revenue', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: ORDERABLE_TYPES.SERVICE_ORDER,
        });
        const payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
            status: PAYMENT_INTENT_STATUSES.SUCCEEDED,
            totalAmount: 10,
            createdAt: moment.tz(yesterday, timeZone).format(),
        });

        await sendDailyDigestEmail(today, yesterday);

        const [, mail] = axiosPostspy.getCall(0).args;
        
        expect(mail.personalizations).to.have.lengthOf(1);
        expect(mail.personalizations[0].dynamic_template_data.ordersRevenue).to.equal(currency(payment.totalAmount));
    });

    it('should send daily digest with orders revenue without timezone', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: ORDERABLE_TYPES.SERVICE_ORDER,
        });
        await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
            status: PAYMENT_INTENT_STATUSES.SUCCEEDED,
            totalAmount: 10,
            createdAt: moment.tz(yesterday).format(),
        });

        await StoreSettings.query()
          .where('storeId', store.id)
          .patch({
              timeZone: null,
          })
          .returning('*');

        await sendDailyDigestEmail(today, yesterday);

        const [, mail] = axiosPostspy.getCall(0).args;

        expect(mail.personalizations).to.have.lengthOf(1);
    });

    it('should send daily digest with new customers', async () => {
        const centsCustomer = await factory.create(FN.centsCustomer, {
            createdAt: moment.tz(yesterday, timeZone).format(),
            phoneNumber: '1234567891',
        });
        const centsCustomer2 = await factory.create(FN.centsCustomer, {
            createdAt: moment.tz('2000-03-03', timeZone).format(),
            phoneNumber: '12345678917',
        });
        const storeCustomer = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            businessId: store.businessId,
            centsCustomerId: centsCustomer.id,
        });
        const storeCustomer2 = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            businessId: store.businessId,
            centsCustomerId: centsCustomer2.id,
        });

        await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id
        });

        await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer2.id
        });

        await sendDailyDigestEmail(today, yesterday);

        const [, mail] = axiosPostspy.getCall(0).args;
        
        expect(mail.personalizations).to.have.lengthOf(1);
        expect(mail.personalizations[0].dynamic_template_data.newCustomersCount).to.equal('1');
    });

    it('should send daily digest with completed orders', async () => {
        await factory.create(FN.serviceOrder, {
            turnAroundInHours: 0,
            storeId: store.id,
            status: statuses.COMPLETED,
            completedAt: moment.tz('2000-03-03', timeZone).format(),
        });

        await factory.create(FN.serviceOrder, {
            turnAroundInHours: 0,
            storeId: store.id,
            status: statuses.COMPLETED,
            completedAt: moment.tz(yesterday, timeZone).format(),
        });

        await sendDailyDigestEmail(today, yesterday);

        const [, mail] = axiosPostspy.getCall(0).args;
        
        expect(mail.personalizations).to.have.lengthOf(1);
        expect(mail.personalizations[0].dynamic_template_data.completedServiceOrdersCount).to.equal('1');
    });

    it('should send daily digest with delivered orders', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            orderType: ORDER_TYPES.ONLINE
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            storeId: store.id,
            orderableType: ORDERABLE_TYPES.SERVICE_ORDER,
        });

        await factory.create(FN.orderDelivery, {
            orderId: order.id,
            storeId: store.id,
            type: ORDER_DELIVERY_TYPES.RETURN,
            deliveredAt: moment.tz(yesterday, timeZone).format(),
        });

        await factory.create(FN.orderDelivery, {
            orderId: order.id,
            storeId: store.id,
            type: ORDER_DELIVERY_TYPES.RETURN,
            deliveredAt: moment().tz(timeZone).format(),
        });
        
        await sendDailyDigestEmail(today, yesterday);

        const [, mail] = axiosPostspy.getCall(0).args;
        
        expect(mail.personalizations).to.have.lengthOf(1);
        expect(mail.personalizations[0].dynamic_template_data.deliveredOrdersCount).to.equal('1');
    });

    it('should send daily digest with picked up orders', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            orderType: ORDER_TYPES.ONLINE
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            storeId: store.id,
            orderableType: ORDERABLE_TYPES.SERVICE_ORDER,
        });

        await factory.create(FN.orderDelivery, {
            orderId: order.id,
            storeId: store.id,
            type: ORDER_DELIVERY_TYPES.PICKUP,
            status: orderDeliveryStatuses.COMPLETED,
            updatedAt: moment.tz(yesterday, timeZone).format(),
        });

        await factory.create(FN.orderDelivery, {
            orderId: order.id,
            storeId: store.id,
            type: ORDER_DELIVERY_TYPES.PICKUP,
            updatedAt: moment().tz(timeZone).format(),
        });
        
        await sendDailyDigestEmail(today, yesterday);

        const [, mail] = axiosPostspy.getCall(0).args;
        
        expect(mail.personalizations).to.have.lengthOf(1);
        expect(mail.personalizations[0].dynamic_template_data.pickedUpOrdersCount).to.equal('1');
    });

    it('should send daily digest with pickups scheduled for today', async () => {
        const deliveryWindow1 = copyMomentDate(
            moment().tz(timeZone), 
            moment.utc(UNIX_DATE_TIME_STR_10_00),
        );
        const deliveryWindow2 = copyMomentDate(
            moment().tz(timeZone), 
            moment.utc(UNIX_DATE_TIME_STR_23_30),
        );
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            orderType: ORDER_TYPES.ONLINE
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            storeId: store.id,
            orderableType: ORDERABLE_TYPES.SERVICE_ORDER,
        });

        await factory.create(FN.orderDelivery, {
            orderId: order.id,
            storeId: store.id,
            type: ORDER_DELIVERY_TYPES.PICKUP,
            status: orderDeliveryStatuses.SCHEDULED,
            deliveryWindow: [
                deliveryWindow1.unix() * 1000, 
                deliveryWindow2.unix() * 1000,
            ],
        });
        
        await sendDailyDigestEmail(today, yesterday);

        const [, mail] = axiosPostspy.getCall(0).args;
        
        expect(mail.personalizations).to.have.lengthOf(1);
        expect(mail.personalizations[0].dynamic_template_data.pickupsCountScheduledForToday).to.equal('1');
    });

    it('should send daily digest with deliveries scheduled for today', async () => {
        const deliveryWindow1 = copyMomentDate(
            moment().tz(timeZone), 
            moment.utc(UNIX_DATE_TIME_STR_10_00),
        );
        const deliveryWindow2 = copyMomentDate(
            moment().tz(timeZone), 
            moment.utc(UNIX_DATE_TIME_STR_23_30),
        );
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            orderType: ORDER_TYPES.ONLINE
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            storeId: store.id,
            orderableType: ORDERABLE_TYPES.SERVICE_ORDER,
        });

        await factory.create(FN.orderDelivery, {
            orderId: order.id,
            storeId: store.id,
            type: ORDER_DELIVERY_TYPES.RETURN,
            status: orderDeliveryStatuses.SCHEDULED,
            deliveryWindow: [
                deliveryWindow1.unix() * 1000, 
                deliveryWindow2.unix() * 1000,
            ],
        });

        await factory.create(FN.orderDelivery, {
            orderId: order.id,
            storeId: store.id,
            type: ORDER_DELIVERY_TYPES.PICKUP,
        });
        
        await sendDailyDigestEmail(today, yesterday);

        const [, mail] = axiosPostspy.getCall(0).args;
        
        expect(mail.personalizations).to.have.lengthOf(1);
        expect(mail.personalizations[0].dynamic_template_data.deliveriesCountScheduledForToday).to.equal('1');
    });

    it('should send daily digest with new service orders and total order value', async () => {
        const orderTotal = 20;

        await factory.create(FN.serviceOrder, {
            orderTotal,
            storeId: store.id,
            placedAt: moment.tz(yesterday, timeZone).format(),
        });

        await factory.create(FN.serviceOrder, {
            orderTotal,
            storeId: store.id,
            placedAt: moment.tz(today, timeZone).format(),
        });
        
        await sendDailyDigestEmail(today, yesterday);

        const [, mail] = axiosPostspy.getCall(0).args;
        
        expect(mail.personalizations).to.have.lengthOf(1);
        expect(mail.personalizations[0].dynamic_template_data.serviceOrdersCount).to.equal('1');
        expect(mail.personalizations[0].dynamic_template_data.serviceOrdersTotalValue).to.equal(currency(orderTotal));
    });

    it('should send daily digest with new inventory orders and total order value', async () => {
        const orderTotal = 20;

        await factory.create(FN.inventoryOrder, {
            orderTotal,
            storeId: store.id,
            createdAt: moment.tz(yesterday, timeZone).format(),
        });

        await factory.create(FN.inventoryOrder, {
            orderTotal,
            storeId: store.id,
            createdAt: moment.tz(today, timeZone).format(),
        });
        
        await sendDailyDigestEmail(today, yesterday);

        const [, mail] = axiosPostspy.getCall(0).args;
        
        expect(mail.personalizations).to.have.lengthOf(1);
        expect(mail.personalizations[0].dynamic_template_data.inventoryOrdersCount).to.equal('1');
        expect(mail.personalizations[0].dynamic_template_data.inventoryOrdersTotalValue).to.equal(currency(orderTotal));
    });

    it('should send daily digest with total pounds processed', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });

        const serviceOrderWeight = await factory.create(FN.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
            chargeableWeight: 5,
        });

        await factory.create(FN.orderActivityLog, {
            orderId: serviceOrder.id,
            status: statuses.READY_FOR_PICKUP,
            updatedAt: moment.tz(yesterday, timeZone).format(),
        });

        await factory.create(FN.orderActivityLog, {
            orderId: serviceOrder.id,
            status: statuses.READY_FOR_PICKUP,
        });
        
        await sendDailyDigestEmail(today, yesterday);

        const [, mail] = axiosPostspy.getCall(0).args;
        
        expect(mail.personalizations).to.have.lengthOf(1);
        expect(mail.personalizations[0].dynamic_template_data.lbsProcessed).to.equal(`${serviceOrderWeight.chargeableWeight}.00`);
    });

    it('should send daily digest with total pounds unprocessed', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });

        const serviceOrderWeight = await factory.create(FN.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
            chargeableWeight: 5,
        });

        await factory.create(FN.orderActivityLog, {
            orderId: serviceOrder.id,
            updatedAt: moment().tz(timeZone),
        });
        
        await sendDailyDigestEmail(today, yesterday);

        const [, mail] = axiosPostspy.getCall(0).args;
        
        expect(mail.personalizations).to.have.lengthOf(1);
        expect(mail.personalizations[0].dynamic_template_data.lbsUnProcessed).to.equal(`${serviceOrderWeight.chargeableWeight}.00`);
    });
});

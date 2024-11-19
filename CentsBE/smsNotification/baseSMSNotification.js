const jwt = require('jsonwebtoken');
const enMessages = require('./templates/en');
const esMessages = require('./templates/es');
const splitFullName = require('../utils/splitFullName');
const Store = require('../models/store');
const { TERMS_OF_SERVICE } = require('../constants/constants');
const getShortUrl = require('../utils/urlShortener');
const { sendSMS, createOrderNotificationLog, sendScheduledSMS } = require('../workers/sms');
const Order = require('../models/orders');

class BaseSMSNotification {
    constructor(serviceOrder, storeCustomer, eventName) {
        this.serviceOrder = serviceOrder;
        this.storeCustomer = storeCustomer;
        this.locale = storeCustomer.languageId === 2 ? 'es' : 'en';
        this.languageId = storeCustomer.languageId;
        this.phoneNumber = storeCustomer.phoneNumber;
        this.store = {};
        this.routeInfo = serviceOrder.routeInfo;
        this.returnOrderDelivery = {};
        this.eventName = eventName;
        this.smsDateScheduled = serviceOrder.smsDateScheduled;
    }

    async notify(message) {
        const sms = await sendSMS({
            message,
            phoneNumber: this.phoneNumber,
        });
        if (sms) {
            await createOrderNotificationLog({
                orderId: this.serviceOrder.id,
                sms,
                phoneNumber: this.phoneNumber,
                orderStatus: this.serviceOrder.status,
                languageId: this.languageId,
                notifiedAt: sms.dateCreated.toISOString(),
                eventName: this.eventName,
            });
        }
        return sms;
    }

    async scheduleNotification(message) {
        const sms = await sendScheduledSMS({
            message,
            phoneNumber: this.phoneNumber,
            dateScheduled: this.smsDateScheduled,
        });
        if (sms) {
            await createOrderNotificationLog({
                orderId: this.serviceOrder.id,
                sms,
                phoneNumber: this.phoneNumber,
                orderStatus: this.serviceOrder.status,
                languageId: this.languageId,
                notifiedAt: this.smsDateScheduled,
                eventName: this.eventName,
            });
        }
        return sms;
    }

    getMessage(type) {
        const messages = this.locale === 'en' ? enMessages : esMessages;
        return messages[type];
    }

    get isPostPay() {
        return this.serviceOrder.paymentTiming !== 'PRE-PAY';
    }

    get firstName() {
        const { firstName: name, fullName } = this.storeCustomer;
        if (name && name.length) {
            return name;
        }
        return splitFullName(fullName).firstName;
    }

    get orderCode() {
        return this.serviceOrder.orderCode;
    }

    get netOrderTotal() {
        return `$${Number(this.serviceOrder.netOrderTotal).toFixed(2)}`;
    }

    get termsOfServiceUrl() {
        const { termsOfServiceUrl } = this.store;
        return termsOfServiceUrl && termsOfServiceUrl.length ? termsOfServiceUrl : TERMS_OF_SERVICE;
    }

    get storePhoneNumber() {
        return this.store.phoneNumber;
    }

    async setStore() {
        this.store = await Store.query()
            .select('stores.*', 'businessSettings.termsOfServiceUrl', 'storeSettings.timeZone')
            .leftJoin('businessSettings', 'businessSettings.businessId', 'stores.businessId')
            .leftJoin('storeSettings', 'storeSettings.storeId', 'stores.id')
            .where('stores.id', this.serviceOrder.storeId)
            .first();
    }

    async getReturnOrderDelivery() {
        this.returnOrderDelivery = await Order.query().withGraphJoined('delivery').findOne({
            orderableId: this.serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
    }

    async getPickupOrderDelivery() {
        this.pickupOrderDelivery = await Order.query().withGraphJoined('pickup').findOne({
            orderableId: this.serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
    }

    async shortOrderURL() {
        const token = jwt.sign({ id: this.serviceOrder.id }, process.env.JWT_SECRET_TOKEN_ORDER);
        const shortUrl = await getShortUrl(`${process.env.LIVE_LINK}${token}`);
        return shortUrl;
    }
}

module.exports = exports = BaseSMSNotification;

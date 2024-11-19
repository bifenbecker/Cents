const { isEmpty } = require('lodash');
const BaseSMSNotification = require('./baseSMSNotification');
const {
    enPickupVersion,
    esPickupVersion,
    enEtaUpdated,
    esEtaUpdated,
    enFirstPickupVersion,
    esFirstPickupVersion,
    enSecondPickupVersion,
    esSecondPickupVersion,
} = require('./templates/enRoute/pickup');
const {
    enDeliverVersion,
    esDeliverVersion,
    enFirstDeliverVersion,
    esFirstDeliverVersion,
    enSecondDeliverVersion,
    esSecondDeliverVersion,
} = require('./templates/enRoute/deliver');
const {
    routeDeliveryCompleted: enRouteDeliveryCompleted,
    routeDeliveryCanceled: enRouteDeliveryCanceled,
    pickupOrderCanceled: enPickupOrderCanceled,
} = require('./templates/en');
const {
    routeDeliveryCompleted: esRouteDeliveryCompleted,
    routeDeliveryCanceled: esRouteDeliveryCanceled,
    pickupOrderCanceled: esPickupOrderCanceled,
} = require('./templates/es');
const { renderString } = require('../lib/mustache-render');
const getShortUrl = require('../utils/urlShortener');
const { getDeliveryWindowString } = require('../utils/getDeliveryWindowString');
const { orderDeliveryStatuses, statuses, deliveryProviders } = require('../constants/constants');

class BaseOrderSmsNotification extends BaseSMSNotification {
    // TODO fetch terms of service url.
    async intakeCompleted() {
        const messageTemplate = this.getMessage(
            this.isPostPay ? 'intakeCompletedPostPay' : 'intakeCompletedPrePay',
        );
        await this.setStore();
        const shortURL = await this.shortOrderURL();
        const options = {
            firstName: this.firstName,
            orderCode: this.orderCode,
            netOrderTotal: this.netOrderTotal,
            storePhoneNumber: this.storePhoneNumber,
            termsOfServiceUrl: this.termsOfServiceUrl,
            shortURL,
        };
        const message = renderString(messageTemplate, options);
        const sms = await this.notify(message);
        return sms;
    }

    async getOptionsForEnRoute() {
        const shortURL = await this.shortOrderURL();
        return {
            firstName: this.firstName,
            storePhoneNumber: this.storePhoneNumber,
            termsOfServiceUrl: this.termsOfServiceUrl,
            shortURL,
            eta: this.routeInfo.eta,
            storeName: this.store.name,
        };
    }

    getStopNumberOptions() {
        return {
            stopNumber: this.routeInfo.stopNumber,
            stopsBeforeCurrent:
                this.routeInfo.stopNumber && this.routeInfo.stopNumber > 0
                    ? Number(this.routeInfo.stopNumber) - 1
                    : 0,
        };
    }

    async enRouteToPickup() {
        let messageTemplate;
        switch (Number(this.routeInfo.stopNumber)) {
            case 1:
                messageTemplate =
                    this.locale === 'en' ? enFirstPickupVersion : esFirstPickupVersion;
                break;
            case 2:
                messageTemplate =
                    this.locale === 'en' ? enSecondPickupVersion : esSecondPickupVersion;
                break;
            default:
                messageTemplate = this.locale === 'en' ? enPickupVersion : esPickupVersion;
                break;
        }
        await this.setStore();
        const options = {
            ...(await this.getOptionsForEnRoute()),
            ...this.getStopNumberOptions(),
        };
        const message = renderString(messageTemplate, options);
        const sms = await this.notify(message);
        return sms;
    }

    async enRouteToDropOff() {
        let messageTemplate;
        switch (Number(this.routeInfo.stopNumber)) {
            case 1:
                messageTemplate =
                    this.locale === 'en' ? enFirstDeliverVersion : esFirstDeliverVersion;
                break;
            case 2:
                messageTemplate =
                    this.locale === 'en' ? enSecondDeliverVersion : esSecondDeliverVersion;
                break;
            default:
                messageTemplate = this.locale === 'en' ? enDeliverVersion : esDeliverVersion;
                break;
        }
        await this.setStore();
        const options = {
            ...(await this.getOptionsForEnRoute()),
            ...this.getStopNumberOptions(),
        };
        const message = renderString(messageTemplate, options);
        const sms = await this.notify(message);
        return sms;
    }

    async enRouteEtaUpdated() {
        const messageTemplate = this.locale === 'en' ? enEtaUpdated : esEtaUpdated;
        await this.setStore();
        const options = await this.getOptionsForEnRoute();
        const message = renderString(messageTemplate, options);
        const sms = await this.notify(message);
        return sms;
    }

    async inTransitToStore() {
        const messageTemplate = this.locale === 'en' ? enDeliverVersion : esDeliverVersion;
        await this.setStore();
        const options = await this.getOptionsForEnRoute();
        const message = renderString(messageTemplate, options);
        const sms = await this.notify(message);
        return sms;
    }

    async droppedOffAtStore() {
        const messageTemplate =
            this.locale === 'en' ? enRouteDeliveryCompleted : esRouteDeliveryCompleted;
        await this.setStore();
        const options = await this.getOptionsForEnRoute();
        const message = renderString(messageTemplate, options);
        const sms = await this.notify(message);
        return sms;
    }

    async deliveryOrderCanceled() {
        const messageTemplate =
            this.locale === 'en' ? enRouteDeliveryCanceled : esRouteDeliveryCanceled;
        await this.setStore();
        const options = await this.getOptionsForEnRoute();
        const message = renderString(messageTemplate, options);
        const sms = await this.notify(message);
        return sms;
    }

    async pickupOrderCanceled() {
        const messageTemplate =
            this.locale === 'en' ? enPickupOrderCanceled : esPickupOrderCanceled;
        await this.setStore();
        const liveLinkBaseUrl = process.env.LIVE_LINK.split('/order-summary');
        const shortURL = await getShortUrl(
            `${liveLinkBaseUrl[0]}/order/business/${this.store.businessId}`,
        );
        const message = renderString(messageTemplate, {
            shortURL,
            storeName: this.store.name,
        });
        const sms = await this.notify(message);
        return sms;
    }

    async onlineOrderCreated() {
        await this.setStore();
        const shortURL = await this.shortOrderURL();
        const messageTemplate = this.getMessage('onlineOrderCreated');
        const options = {
            shortURL,
            storeName: this.store.name,
        };
        const message = renderString(messageTemplate, options);
        const sms = await this.notify(message);
        return sms;
    }

    async orderCreated() {
        await this.setStore();
        const shortURL = await this.shortOrderURL();
        const messageTemplate = this.getMessage(
            this.isPostPay ? 'createOrderPostPay' : 'createOrder',
        );
        const options = {
            shortURL,
            storeName: this.store.name,
        };
        const message = renderString(messageTemplate, options);
        const sms = await this.notify(message);
        return sms;
    }

    async readyForPickup() {
        await this.setStore();
        const shortURL = await this.shortOrderURL();
        const messageTemplate = this.getMessage('readyForPickup');
        const options = {
            shortURL,
            storeName: this.store.name,
        };
        const message = renderString(messageTemplate, options);
        const sms = await this.notify(message);
        return sms;
    }

    async readyForPickupScheduled() {
        await this.setStore();
        const shortURL = await this.shortOrderURL();
        const messageTemplate = this.getMessage('readyForPickup');
        const options = {
            shortURL,
            storeName: this.store.name,
        };
        const message = renderString(messageTemplate, options);
        const sms = await this.scheduleNotification(message);
        return sms;
    }

    getSmsTextByStatusForLiveLink() {
        if (
            this.serviceOrder.status === 'HUB_PROCESSING_COMPLETE' &&
            this.serviceOrder.paymentStatus !== 'PAID'
        ) {
            return this.getMessage('sendLiveLinkTextHubProcessingComplete');
        }
        if (this.serviceOrder.status === 'READY_FOR_PROCESSING') {
            return this.getMessage('sendLiveLinkTextReadyForProcessing');
        }
        return new Error('SMS not required for the order');
    }

    async sendLiveLink() {
        await this.setStore();
        const shortURL = await this.shortOrderURL();
        const messageTemplate = this.getSmsTextByStatusForLiveLink();
        const options = {
            shortURL,
            storeName: this.store.name,
        };
        const message = renderString(messageTemplate, options);
        const sms = await this.notify(message);
        return sms;
    }

    async orderCompleted() {
        await this.setStore();
        const shortURL = await this.shortOrderURL();
        const messageTemplate = this.getMessage('orderCompleted');
        const options = {
            shortURL,
            storeName: this.store.name,
        };
        const message = renderString(messageTemplate, options);
        const sms = await this.notify(message);
        return sms;
    }

    async intentOrderDeliveryNotification() {
        if (
            [statuses.CANCELLED, statuses.COMPLETED, 'CANCELED'].includes(this.serviceOrder.status)
        ) {
            return null;
        }
        await this.setStore();
        await this.getReturnOrderDelivery();
        const { delivery } = this.returnOrderDelivery;
        if (isEmpty(delivery)) {
            return null;
        }
        let options = {
            storeName: this.store.name,
        };
        let messageTemplate = '';
        if (delivery && delivery.status === orderDeliveryStatuses.INTENT_CREATED) {
            // do not send message the night before if order is not processed yet
            return false;
        }

        messageTemplate = this.getMessage('intentOrderDeliveryReady');
        const shortURL = await this.shortOrderURL();
        const startTime = Number(delivery.deliveryWindow[0]);
        const endTime = Number(delivery.deliveryWindow[1]);
        options = {
            ...options,
            shortURL,
            shift: getDeliveryWindowString(startTime, endTime, this.store.timeZone),
        };

        const message = renderString(messageTemplate, options);
        const sms = await this.notify(message);
        return sms;
    }

    async intentOrderPickupNotification() {
        if (![statuses.SUBMITTED].includes(this.serviceOrder.status)) {
            return null;
        }
        await this.setStore();
        await this.getPickupOrderDelivery();
        const { pickup } = this.pickupOrderDelivery;
        if (isEmpty(pickup)) {
            return null;
        }
        let options = {
            storeName: this.store.name,
        };
        let messageTemplate = '';
        if (
            pickup &&
            pickup.deliveryProvider === deliveryProviders.DOORDASH &&
            pickup.status !== orderDeliveryStatuses.EN_ROUTE_TO_PICKUP
        ) {
            // check to see if doordash pickup and driver is not already assigned
            messageTemplate = this.getMessage('intentOrderPickupDelayed');
            const shortURL = await this.shortOrderURL();
            options = {
                ...options,
                shortURL,
            };

            const message = renderString(messageTemplate, options);
            return this.notify(message);
        }

        return false;
    }

    async orderPaymentFailed() {
        await this.setStore();
        const shortURL = await this.shortOrderURL();
        const messageTemplate = this.getMessage('orderPaymentFailed');
        const options = {
            shortURL,
            storeName: this.store.name,
        };
        const message = renderString(messageTemplate, options);
        const sms = await this.notify(message);
        return sms;
    }

    async orderProcessingDelayed() {
        await this.setStore();
        const messageTemplate = this.getMessage('orderProcessingDelayed');
        const options = {
            storeName: this.store.name,
        };
        const message = renderString(messageTemplate, options);
        const sms = await this.notify(message);
        return sms;
    }
}

module.exports = exports = BaseOrderSmsNotification;

const BaseSMSNotification = require('./baseSMSNotification');
const { renderString } = require('../lib/mustache-render');

class RouteDeliverySMSNotification extends BaseSMSNotification {
    async sendRouteDeliveryCanceledNotification() {
        await this.setStore();
        const messageTemplate = this.getMessage('routeDeliveryCanceled');
        const message = renderString(messageTemplate, {
            shortURL: await this.shortOrderURL(),
            storeName: this.store.name,
        });
        const sms = await this.notify(message);
        return sms;
    }

    async sendRouteDeliveryCompleteNotification() {
        await this.setStore();
        const messageTemplate = this.getMessage('routeDeliveryCompleted');
        const message = renderString(messageTemplate, {
            shortURL: await this.shortOrderURL(),
            storeName: this.store.name,
        });
        const sms = await this.notify(message);
        return sms;
    }
}

module.exports = exports = RouteDeliverySMSNotification;

const BaseOrderSmsNotification = require('./baseOrderSmsNotification');
const { renderString } = require('../lib/mustache-render');
const enOnlineMessages = require('./templates/onlineOrder/en');
const { getDeliveryWindowString } = require('../utils/getDeliveryWindowString');
const { dateFormat } = require('../helpers/dateFormatHelper');

// const  esOnlineMessages  = require('./templates/onlineOrder/es') //

class OnlineOrderSmsNotification extends BaseOrderSmsNotification {
    // getCustomizedMessage(type) {
    //   const messages = this.locale == 'en' ? enOnlineMessages : esOnlineMessages
    //   return messages[type]
    // }

    async intakeCompleted() {
        const messageTemplate = enOnlineMessages.intakeCompleted;
        await this.setStore();
        const shortURL = await this.shortOrderURL();
        const options = {
            firstName: this.firstName,
            termsOfServiceUrl: this.termsOfServiceUrl,
            netOrderTotal: this.netOrderTotal,
            shortURL,
            storeName: this.store.name,
        };
        const message = renderString(messageTemplate, options);
        const sms = await this.notify(message);
        return sms;
    }

    async recurringOnlineOrder() {
        const messageTemplate = enOnlineMessages.recurringOnlineOrder;
        await this.setStore();
        const shortURL = await this.shortOrderURL();
        await this.getPickupOrderDelivery();
        const { pickup } = this.pickupOrderDelivery;
        const startTime = Number(pickup.deliveryWindow[0]);
        const endTime = Number(pickup.deliveryWindow[1]);
        const pickupDate = dateFormat(startTime, this.store.timeZone, 'MM/DD/YYYY');
        const options = {
            pickupDate,
            pickupWindow: getDeliveryWindowString(startTime, endTime, this.store.timeZone),
            shortURL,
            storeName: this.store.name,
        };
        const message = renderString(messageTemplate, options);
        const sms = await this.notify(message);
        return sms;
    }
}

module.exports = exports = OnlineOrderSmsNotification;

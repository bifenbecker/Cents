const BaseOrderSmsNotification = require('./baseOrderSmsNotification');
const { renderString } = require('../lib/mustache-render');
const { intakeCompleted: enResidentialMessages } = require('./templates/onlineOrder/en');
const { intakeCompleted: esResidentialMessages } = require('./templates/onlineOrder/es');

class ResidentialOrderSmsNotification extends BaseOrderSmsNotification {
    getCustomizedMessage(type) {
        const messages = this.locale === 'en' ? enResidentialMessages : esResidentialMessages;
        return messages[type];
    }

    async intakeCompleted() {
        await this.setStore();
        const messageTemplate = this.getCustomizedMessage('intakeCompleted');
        const options = { name: this.storeCustomer.firstName, storeName: this.store.name };
        const message = renderString(messageTemplate, options);
        const sms = await this.notify(message);
        return sms;
    }
}

module.exports = exports = ResidentialOrderSmsNotification;

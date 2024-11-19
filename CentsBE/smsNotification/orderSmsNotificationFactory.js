const OnlineOrderSmsNotification = require('./onlineOrderSmsNotification');
const ServiceOrderSmsNotification = require('./serviceOrderSmsNotification');
const ResidentialOrderSmsNotification = require('./residentialOrderSmsNotification');

class OrderSmsNotificationFactory {
    constructor(serviceOrder, customer, eventName) {
        this.serviceOrder = serviceOrder;
        this.customer = customer;
        this.eventName = eventName;
    }

    findSmsNotificationInstance() {
        switch (this.serviceOrder.orderType) {
            case 'ONLINE':
                // return online order sms notification instance
                return new OnlineOrderSmsNotification(
                    this.serviceOrder,
                    this.customer,
                    this.eventName,
                );
            case 'RESIDENTIAL':
                // return residential order sms notification instance
                return new ResidentialOrderSmsNotification(
                    this.serviceOrder,
                    this.customer,
                    this.eventName,
                );
            default:
                return new ServiceOrderSmsNotification(
                    this.serviceOrder,
                    this.customer,
                    this.eventName,
                );
        }
    }
}

module.exports = exports = OrderSmsNotificationFactory;

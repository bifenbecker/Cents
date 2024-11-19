const {
    deliveryProviders,
    orderDeliveryStatuses,
    statuses,
    paymentStatuses,
} = require('../../constants/constants');
const OrderDelivery = require('../../models/orderDelivery');
const Order = require('../../models/orders');
const ServiceOrder = require('../../models/serviceOrders');
const Payment = require('../../models/payment');
const StripePayment = require('../stripe/stripePayment');

class ServiceOrderQuery {
    constructor(serviceOrderId, transaction = null) {
        this.serviceOrderId = serviceOrderId;
        this.transaction = transaction;
    }

    serviceOrderDetails() {
        return ServiceOrder.query(this.transaction).findById(this.serviceOrderId);
    }

    async activeDeliveries() {
        const deliveries = OrderDelivery.query(this.transaction)
            .withGraphJoined('[order]')
            .andWhere({
                orderableId: this.serviceOrderId,
                orderableType: 'ServiceOrder',
            })
            .whereNotIn('orderDeliveries.status', [
                orderDeliveryStatuses.CANCELED,
                statuses.CANCELLED,
                orderDeliveryStatuses.COMPLETED,
                orderDeliveryStatuses.FAILED,
            ]);
        return deliveries;
    }

    async completedDeliveries() {
        const deliveries = OrderDelivery.query(this.transaction)
            .withGraphJoined('[order]')
            .andWhere({
                orderableId: this.serviceOrderId,
                orderableType: 'ServiceOrder',
            })
            .whereIn('orderDeliveries.status', [orderDeliveryStatuses.COMPLETED]);
        return deliveries;
    }

    async cancelledPickup() {
        const pickup = OrderDelivery.query(this.transaction)
            .withGraphJoined('[order]')
            .andWhere({
                orderableId: this.serviceOrderId,
                orderableType: 'ServiceOrder',
            })
            .where('orderDeliveries.type', 'PICKUP')
            .whereIn('orderDeliveries.status', [orderDeliveryStatuses.CANCELED, statuses.CANCELLED])
            .first();
        return pickup;
    }

    async cancelledDelivery() {
        const delivery = OrderDelivery.query(this.transaction)
            .withGraphJoined('[order]')
            .andWhere({
                orderableId: this.serviceOrderId,
                orderableType: 'ServiceOrder',
            })
            .where('orderDeliveries.type', 'RETURN')
            .whereIn('orderDeliveries.status', [orderDeliveryStatuses.CANCELED, statuses.CANCELLED])
            .first();
        return delivery;
    }

    async doordashPickup() {
        const order = await Order.query(this.transaction)
            .findOne({
                orderableId: this.serviceOrderId,
                orderableType: 'ServiceOrder',
            })
            .withGraphJoined('pickup')
            .where('pickup.deliveryProvider', deliveryProviders.DOORDASH);
        return order ? order.pickup : null;
    }

    async doordashDelivery() {
        const order = await Order.query(this.transaction)
            .findOne({
                orderableId: this.serviceOrderId,
                orderableType: 'ServiceOrder',
            })
            .withGraphJoined('delivery')
            .where('delivery.deliveryProvider', deliveryProviders.DOORDASH);
        return order ? order.delivery : null;
    }

    async pendingPayment() {
        const order = await Order.query(this.transaction)
            .findOne({
                orderableId: this.serviceOrderId,
                orderableType: 'ServiceOrder',
            })
            .withGraphJoined('payments')
            .orderBy('payments.updatedAt', 'desc');
        if (!order || !order.payments.length) {
            return null;
        }
        return order.payments[0].status === 'requires_confirmation' ? order.payments[0] : null;
    }

    async updatePaymentStatus() {
        let paymentStatus = '';
        const orderDetails = await this.serviceOrderDetails();
        if (orderDetails.balanceDue > 0) {
            const pendingPayment = await this.pendingPayment();

            if (pendingPayment) {
                paymentStatus = paymentStatuses.PENDING;
            } else {
                paymentStatus =
                    orderDetails.paymentStatus === paymentStatuses.INVOICING
                        ? paymentStatuses.INVOICING
                        : paymentStatuses.BALANCE_DUE;
            }
        } else {
            paymentStatus = paymentStatuses.PAID;
        }
        await orderDetails
            .$query(this.transaction)
            .update({
                paymentStatus,
            })
            .context({
                afterUpdateHookCancel: true,
            });
    }

    async cancelPendingPayment() {
        const pendingPayment = await this.pendingPayment();
        if (pendingPayment) {
            const stripe = new StripePayment(pendingPayment.paymentToken);
            const canceledPaymentIntent = await stripe.cancelPaymentIntent();
            await Payment.query(this.transaction)
                .update({
                    status: canceledPaymentIntent.status,
                })
                .where('id', pendingPayment.id);
        }
    }

    async fetchPayments() {
        const orderDetails = await Order.query(this.transaction)
            .findOne({
                orderableId: this.serviceOrderId,
                orderableType: 'ServiceOrder',
            })
            .withGraphJoined('payments')
            .orderBy('payments.updatedAt', 'desc');
        if (orderDetails && orderDetails.payments) {
            return orderDetails.payments;
        }
        return [];
    }

    async hasSuccessfulPayment() {
        const payments = await this.fetchPayments();
        if (payments.length) {
            return payments.find((payment) => payment.status === 'succeeded');
        }
        return false;
    }
}

module.exports = exports = ServiceOrderQuery;

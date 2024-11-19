const OrderActivityLog = require('../../../../models/orderActivityLog');
const ServiceOrderBags = require('../../../../models/serviceOrderBags');
const getOrderPromoDetails = require('../../queries/getPromotionDetailsForOrder');
const CreditReason = require('../../../../models/creditReasons');
const creditHistory = require('../../../../models/creditHistory');
const OrderDelivery = require('../../../../models/orderDelivery');
const RouteDelivery = require('../../../../models/routeDeliveries');
const { routeDeliveryStatuses: deliveryStatuses } = require('../../../../constants/constants');
const RouteDeliveryActivityLog = require('../../../../models/routeDeliveryActivityLog');
const ServiceOrderRecurringSubscription = require('../../../../models/serviceOrderRecurringSubscription');
const RecurringSubscription = require('../../../../models/recurringSubscription');

class BaseVoidHandler {
    constructor(serviceOrder, metaData, transaction) {
        this.serviceOrder = serviceOrder;
        this.metaData = metaData;
        this.transaction = transaction;
    }

    /**
     * @description This method handles the voiding of the service order
     */
    async handle() {
        if (this.serviceOrder.promotionId) {
            await this.deleteOrderPromoDetails();
        }
        await this.updateServiceOrder();
        await this.updateServiceOrdersBags();
        await this.createOrderActivityLog();
        await this.cancelDeliveries();
        // add paid amount to credits
        await this.addAmountToCreditHistory();
        if (String(this.metaData.isCancelSubscription) === 'true') {
            await this.cancelSubscription();
        }
        // TODO: sms needs to be sent to customer on voiding the order
    }

    /**
     * @description This function updates the service order status to cancelled
     */
    async updateServiceOrder() {
        this.amountToBeRefunded = this.refundableAmount;
        await this.serviceOrder.$query(this.transaction).patch({
            status: 'CANCELLED',
            refundableAmount: this.amountToBeRefunded,
            promotionId: null,
            promotionAmount: 0,
            netOrderTotal: this.serviceOrder.netOrderTotal + this.serviceOrder.promotionAmount,
        });
    }

    /**
     * @description This function creates order activity log for cancelling the order
     */
    async createOrderActivityLog() {
        await OrderActivityLog.query(this.transaction).insert({
            orderId: this.serviceOrder.id,
            status: 'CANCELLED',
            updatedAt: new Date().toISOString(),
            employeeCode: this.metaData.employeeCode,
            employeeName: this.metaData.employeeName,
            notes: this.metaData.notes,
            origin: this.metaData.origin,
        });
    }

    async updateServiceOrdersBags() {
        await ServiceOrderBags.query(this.transaction)
            .where('serviceOrderId', this.serviceOrder.id)
            .patch({ barcodeStatus: 'CANCELLED', isActiveBarcode: false });
    }

    async createRouteDeliveryActivityLog(routeDeliveryId, status) {
        await RouteDeliveryActivityLog.query(this.transaction).insert({
            status,
            routeDeliveryId,
        });
    }

    async cancelSubscription() {
        const subscription = await ServiceOrderRecurringSubscription.query()
            .select('recurringSubscriptionId')
            .findOne({
                serviceOrderId: this.serviceOrder.id,
            });
        await RecurringSubscription.query(this.transaction)
            .patch({
                deletedAt: new Date().toISOString(),
            })
            .findById(subscription.recurringSubscriptionId);
    }

    async cancelRouteDelivery(orderDeliveryId) {
        const routeDelivery = await RouteDelivery.query(this.transaction)
            .where({ routableId: orderDeliveryId, routableType: 'OrderDelivery' })
            .first();
        if (routeDelivery) {
            const deliveryStatus = deliveryStatuses.CANCELED;
            await routeDelivery.$query(this.transaction).patch({
                status: deliveryStatus,
            });
            await this.createRouteDeliveryActivityLog(routeDelivery.id, deliveryStatus);
        }
    }

    async cancelDeliveries() {
        const orderDeliveries = await OrderDelivery.query(this.transaction)
            .where('orderId', this.serviceOrder.order.id)
            .whereNotIn('status', ['CANCELED', 'COMPLETED']);
        if (orderDeliveries && orderDeliveries.length) {
            await Promise.all(
                orderDeliveries.map(async (orderDelivery) => {
                    await OrderDelivery.query(this.transaction)
                        .patch({
                            status: 'CANCELED',
                        })
                        .findById(orderDelivery.id);
                    await this.cancelRouteDelivery(orderDelivery.id);
                }),
            );
        }
    }

    /**
     * @returns the amount credited back to the customers credit account
     */
    get refundableAmount() {
        return this.serviceOrder.creditAmount;
    }

    /**
     * @description This function deletes the promotiondetails of the order
     */
    async deleteOrderPromoDetails() {
        const { promotionDetails } = await getOrderPromoDetails(
            this.serviceOrder.id,
            'ServiceOrder',
            this.transaction,
        );
        await promotionDetails.$query(this.transaction).delete();
    }

    /**
     * @description This function adds the order amount to the credits when the order is cancelled
     */
    async addAmountToCreditHistory() {
        if (this.amountToBeRefunded && this.amountToBeRefunded > 0) {
            const creditReason = await this.creditReasons;
            await creditHistory
                .query(this.transaction)
                .insert({
                    businessId: this.metaData.businessId,
                    reasonId: creditReason.id,
                    amount: this.amountToBeRefunded,
                    customerId: this.metaData.customerId,
                })
                .returning('*');
        }
    }

    /**
     * @description this function returns the refund credit reason
     */
    get creditReasons() {
        return CreditReason.query(this.transaction)
            .select('id')
            .where('reason', '=', 'Refund')
            .first();
    }
}

module.exports = exports = BaseVoidHandler;

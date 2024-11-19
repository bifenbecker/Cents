const { paymentStatuses } = require('../../../constants/constants');
const Payment = require('../../../models/payment');
const ServiceOrder = require('../../../models/serviceOrders');

/**
 * StripeErrorHandler, to handle the various errors coming from stripe
 */
class StripeErrorHandler {
    /**
     * constructor - description
     *
     * @param  {object} error   the stripe error object
     * @return {object}         the class object
     */
    constructor(error, paymentId) {
        this.error = error;
        this.paymentId = paymentId;
    }

    isStripeError() {
        return ['StripeCardError', 'StripeInvalidRequestError', 'card_error'].includes(
            this.error.type,
        );
    }

    async updatePaymentErrorStatus(transaction) {
        const payment = await Payment.query(transaction)
            .findById(this.paymentId)
            .withGraphJoined('orders');
        if (payment) {
            const { raw, code, decline_code: declineCode } = this.error;
            const status = raw ? raw.decline_code || raw.code : code || declineCode;
            await payment.$query(transaction).patch({
                status,
            });
            const { orderableId } = payment.orders;
            const serviceOrder = await ServiceOrder.query(transaction).findOne({
                id: orderableId,
            });
            if (serviceOrder) {
                await serviceOrder.$query(transaction).patch({
                    paymentStatus: paymentStatuses.BALANCE_DUE,
                });
            }
        }
        return this.error;
    }
}

module.exports = StripeErrorHandler;

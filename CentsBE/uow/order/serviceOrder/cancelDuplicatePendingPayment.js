const ServiceOrderQuery = require('../../../services/queries/serviceOrder');
const StripePayment = require('../../../services/stripe/stripePayment');
const Payment = require('../../../models/payment');
const { paymentStatuses } = require('../../../constants/constants');

async function cancelDuplicatePendingPayment(payload) {
    const { serviceOrderId, transaction, serviceOrder } = payload;
    const serviceOrderQuery = new ServiceOrderQuery(serviceOrderId, transaction);
    const payments = await serviceOrderQuery.fetchPayments();
    const duplicatePayment = payments.find((payment) => payment.status === 'requires_confirmation');
    if (serviceOrder.paymentStatus === paymentStatuses.PAID && duplicatePayment) {
        const stripe = new StripePayment(duplicatePayment.paymentToken);
        const canceledPaymentIntent = await stripe.cancelPaymentIntent();
        await Payment.query(this.transaction)
            .update({
                status: canceledPaymentIntent.status,
            })
            .where('id', duplicatePayment.id);
    }
    return payload;
}

module.exports = exports = cancelDuplicatePendingPayment;

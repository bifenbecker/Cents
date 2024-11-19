const Pipeline = require('../../pipeline');

// Uows
const issueRefundInStripe = require('../../../uow/superAdmin/payments/issueRefundInStripeUow');
const createRefundModel = require('../../../uow/superAdmin/payments/createRefundModelUow');
const updatePaymentStaus = require('../../../uow/superAdmin/payments/updatePaymentStatusUow');
const setOrderPaymentStatusToBalanceDue = require('../../../uow/superAdmin/orders/setOrderPaymentStatusToBalanceDueUow');

/**
 * Refund a Stripe payment and update the ServiceOrder paymentStatus
 *
 * The pipeline contains the following units of work:
 *
 * 1) Process the refund in Stripe;
 * 2) Create a Refund entry for the given Payment;
 * 3) Update the status of the Payment model;
 * 4) Update the paymentStatus of ServiceOrder to BALANCE_DUE;
 * 5) Ensure balance due is properly recalculated and updated for the orderableType
 *
 * @param {Object} payload
 */
async function processStripeRefundPipeline(payload) {
    try {
        const refundPipeline = new Pipeline([
            issueRefundInStripe,
            createRefundModel,
            updatePaymentStaus,
            setOrderPaymentStatusToBalanceDue,
        ]);
        const output = await refundPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = processStripeRefundPipeline;

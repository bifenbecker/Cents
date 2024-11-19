const Pipeline = require('../../pipeline');

// Uows
const createCashPaymentRefund = require('../../../uow/superAdmin/payments/createRefundModelUow');
const updatePaymentStaus = require('../../../uow/superAdmin/payments/updatePaymentStatusUow');
const setOrderPaymentStatusToBalanceDue = require('../../../uow/superAdmin/orders/setOrderPaymentStatusToBalanceDueUow');

/**
 * Mark a cash payment as "refunded" and update the ServiceOrder paymentStatus
 *
 * The pipeline contains the following units of work:
 *
 * 1) Create a Refund entry for the given Payment;
 * 2) Update the status of the Payment model;
 * 3) Update the paymentStatus of ServiceOrder to BALANCE_DUE;
 * 4) Ensure balance due is properly recalculated and updated for the orderableType
 *
 * @param {Object} payload
 */
async function processCashRefundPipeline(payload) {
    try {
        const refundPipeline = new Pipeline([
            createCashPaymentRefund,
            updatePaymentStaus,
            setOrderPaymentStatusToBalanceDue,
        ]);
        const output = await refundPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = processCashRefundPipeline;

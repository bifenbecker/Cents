const { transaction } = require('objection');

const Payment = require('../../../models/payment');
const ServiceOrder = require('../../../models/serviceOrders');
const Order = require('../../../models/orders');
const InventoryOrder = require('../../../models/inventoryOrders');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

function createPaymentObject(obj) {
    return {
        orderId: obj.metadata.orderId,
        // customerId: obj.metadata.customerId,
        storeId: obj.metadata.storeId,
        status: obj.status,
        totalAmount: obj.amount / 100,
        transactionFee: obj.application_fee_amount / 100,
        paymentToken: obj.id,
        stripeClientSecret: obj.client_secret,
        // not applying tax yet
        tax: 0,
        currency: obj.currency,
        destinationAccount: obj.on_behalf_of,
        // hard-coding this for now
        paymentProcessor: 'stripe',
        // applying full amount for now
        appliedAmount: obj.amount / 100,
        unappliedAmount: obj.amount / 100 - obj.amount / 100,
        storeCustomerId: obj.metadata.storeCustomerId,
    };
}

/**
 * Using the master order model, retrieve the specific sub-order
 *
 * @param {Object} order
 */
async function retrieveOrderableInformation(order) {
    const orderable = order.getOrderable();

    return orderable;
}

/**
 * Set the order status for the inventoryOrder
 *
 * @param {String} paymentStatus
 */
function setInventoryOrderStatus(paymentStatus) {
    if (paymentStatus === 'PAID') return 'COMPLETED';

    return 'PAYMENT_REQUIRED';
}

/**
 * Based on the given orderableType, update the order sub-class
 *
 * @param {Object} orderable
 * @param {Number} amount
 * @param {String} orderableType
 * @param {String} paymentStatus
 * @param {String} orderStatus
 * @param {Number} orderableId
 * @param {void} trx
 */
async function updateOrder(orderable, amount, orderableType, paymentStatus, orderableId, trx) {
    const model = orderableType === 'ServiceOrder' ? ServiceOrder : InventoryOrder;
    const balanceDue =
        paymentStatus === 'PAID' ? orderable.balanceDue - amount : orderable.balanceDue;

    const patchObject = {
        paymentStatus,
        balanceDue,
    };
    if (orderableType === 'InventoryOrder') {
        patchObject.status = setInventoryOrderStatus(paymentStatus);
    }
    const updatedModel = await model
        .query(trx)
        .patch(patchObject)
        .findById(orderableId)
        .returning('*');

    return updatedModel;
}

/**
 * Create a payment. Creating a payment requires the following actions:
 *
 * 1) Create a payment given the request. The request either comes from the
 *    createPaymentIntent function or directly from the employee app (for cash card payments);
 * 2) Based on the payment status, update the order status
 * 3) If the order contains any inventory and the payment is successful,
 *    then update the inventory count.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
const createPayment = async (req, res, next) => {
    let trx = null;
    try {
        const request = req.body === undefined ? createPaymentObject(req) : req.body;
        const orderId = req.body === undefined ? request.orderId : req.body.orderId;

        trx = await transaction.start(Payment.knex());

        const order = await Order.query().findById(orderId);
        const orderable = await retrieveOrderableInformation(order);
        const { orderableType } = order;
        const { orderableId } = order;

        const payment = await Payment.query(trx).insert(request).returning('*');

        const paymentStatus = request.status === 'succeeded' ? 'PAID' : 'BALANCE_DUE';

        await updateOrder(
            orderable[0],
            request.totalAmount,
            orderableType,
            paymentStatus,
            orderableId,
            trx,
        );

        await trx.commit();

        if (res !== undefined) {
            return res.status(200).json({
                success: true,
                payment,
            });
        }

        return payment;
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error, req);
        return next(error);
    }
};

module.exports = exports = createPayment;

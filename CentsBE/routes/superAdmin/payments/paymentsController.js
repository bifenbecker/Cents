// Packages
const { val } = require('objection');

// Models
const Payment = require('../../../models/payment');

// Pipelines
const processCashRefundPipeline = require('../../../pipeline/superAdmin/payments/processCashRefundPipeline');
const processStripeRefundPipeline = require('../../../pipeline/superAdmin/payments/processStripeRefundPipeline');
const capturePendingStripePaymentPipeline = require('../../../pipeline/superAdmin/payments/capturePendingStripePaymentPipeline');

// Utils
const mapPayments = require('../../../utils/superAdmin/mapPayments');
const ServiceOrder = require('../../../models/serviceOrders');
const InventoryOrder = require('../../../models/inventoryOrders');
const Order = require('../../../models/orders');
const { ORDERABLE_TYPES } = require('../../../constants/constants');

const PAYMENTS_PER_PAGE = 20;

/**
 * Mark a cash payment as "refunded" and update the paymentStatus of the appropriate Order
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function refundCashPayment(req, res, next) {
    try {
        const { order, payment } = req.constants;
        const payload = {
            payment,
            order,
        };

        await processCashRefundPipeline(payload);

        return res.json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Mark a cash payment as "refunded" and update the paymentStatus of the appropriate Order
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function refundStripePayment(req, res, next) {
    try {
        const { order, payment } = req.constants;
        const payload = {
            payment,
            order,
        };

        await processStripeRefundPipeline(payload);

        return res.json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Capture payment for a pending Stripe payment
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function capturePendingStripePayment(req, res, next) {
    try {
        const { order, payment } = req.constants;
        const payload = {
            payment,
            order,
        };

        await capturePendingStripePaymentPipeline(payload);

        return res.json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get all payments in the Cents ecosystem
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getPayments(req, res, next) {
    try {
        const { pageNumber, searchTerm } = req.query;
        const searchTermNumber = parseFloat(searchTerm);

        const { results, total } = await Payment.query()
            .select(
                `${Payment.tableName}.id`,
                `${Payment.tableName}.status`,
                `${Payment.tableName}.createdAt`,
                `${Payment.tableName}.totalAmount`,
                `${Payment.tableName}.paymentProcessor`,
                `${ServiceOrder.tableName}.orderCode as serviceOrderCode`,
                `${ServiceOrder.tableName}.paymentTiming`,
                `${InventoryOrder.tableName}.orderCode as inventoryOrderCode`,
            )
            .withGraphFetched('store(storeDetails)')
            .joinRelated(Order.tableName)
            .leftJoin(ServiceOrder.tableName, (context) => {
                context
                    .on(`${Order.tableName}.orderableType`, val(ORDERABLE_TYPES.SERVICE_ORDER))
                    .andOn(`${ServiceOrder.tableName}.id`, `${Order.tableName}.orderableId`);
            })
            .leftJoin(InventoryOrder.tableName, (context) => {
                context
                    .on(`${Order.tableName}.orderableType`, val(ORDERABLE_TYPES.INVENTORY_ORDER))
                    .andOn(`${InventoryOrder.tableName}.id`, `${Order.tableName}.orderableId`);
            })
            .where((queryBuilder) => {
                if (!Number.isNaN(searchTermNumber)) {
                    queryBuilder
                        .where(`${Payment.tableName}.totalAmount`, '=', searchTermNumber)
                        .orWhere(`${Payment.tableName}.id`, '=', searchTermNumber);
                }

                if (searchTerm?.trim()) {
                    queryBuilder
                        .orWhere(
                            `${Payment.tableName}.paymentProcessor`,
                            'ilike',
                            `%${searchTerm}%`,
                        )
                        .orWhere(`${Payment.tableName}.status`, 'ilike', `%${searchTerm}%`)
                        .orWhere(`${InventoryOrder.tableName}.orderCode`, 'like', `%${searchTerm}%`)
                        .orWhere(`${ServiceOrder.tableName}.orderCode`, 'like', `%${searchTerm}%`)
                        .orWhere(
                            `${ServiceOrder.tableName}.paymentTiming`,
                            'ilike',
                            `%${searchTerm}%`,
                        );
                }
            })
            .modifiers({
                storeDetails(builder) {
                    builder.select('name');
                },
            })
            .page(pageNumber ?? 0, PAYMENTS_PER_PAGE)
            .orderBy('createdAt', 'DESC');

        return res.status(200).json({
            total,
            payments: await mapPayments(results),
            success: true,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get the payment details
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getPaymentDetails(req, res, next) {
    try {
        const payment = await Payment.query()
            .withGraphFetched('paymentRefunds')
            .findById(req.params.id);
        const order = await Order.query().findById(payment.orderId);
        const orderable = await order.getOrderable().first();

        return res.json({
            success: true,
            payment: {
                ...payment,
                order: orderable,
            },
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    capturePendingStripePayment,
    getPaymentDetails,
    getPayments,
    refundCashPayment,
    refundStripePayment,
};

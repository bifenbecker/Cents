const ServiceOrder = require('../../../models/serviceOrders');
const getSingleOrderLogic = require('../../../uow/singleOrder/getSingleOrderLogicUOW');

/**
 * When an employee creates a pre-pay order and then changes it to post-pay,
 * update the paymentTiming
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateOrderPaymentTiming(req, res, next) {
    try {
        const { id } = req.params;
        const { paymentTiming } = req.body;

        await ServiceOrder.query()
            .patch({
                paymentTiming,
            })
            .findById(id)
            .returning('*');

        const orderDetails = await getSingleOrderLogic(id, req.currentStore);
        res.status(200).json({
            success: true,
            orderDetails,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateOrderPaymentTiming;

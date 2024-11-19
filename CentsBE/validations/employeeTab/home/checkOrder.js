const ServiceOrder = require('../../../models/serviceOrders');

async function verifyOrder(req, res, next) {
    try {
        const { orderId } = req.query;
        if (!Number(orderId)) {
            res.status(422).json({
                error: 'Order Id of type integer is required.',
            });
            return;
        }
        const isOrder = await ServiceOrder.query().findOne({
            id: orderId,
            storeId: req.currentStore.id,
        });
        if (!isOrder) {
            res.status(404).json({
                error: 'Order not found.',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = verifyOrder;

const { transaction } = require('objection');
const ServiceOrder = require('../../models/serviceOrders');
const ServiceOrderBags = require('../../models/serviceOrderBags');
const OrderActivityLog = require('../../models/orderActivityLog');
const { origins } = require('../../constants/constants');
const eventEmitter = require('../../config/eventEmitter');

async function cancelOrder(req, res, next) {
    let trx = null;
    try {
        const { id } = req.params;
        const serviceOrder = await ServiceOrder.query()
            .where('id', id)
            .andWhere('status', 'DESIGNATED_FOR_PROCESSING_AT_HUB')
            .andWhere('storeCustomerId', req.currentCustomer.id)
            .first();

        if (serviceOrder) {
            trx = await transaction.start(ServiceOrder.knex());
            await ServiceOrder.query(trx).findById(id).patch({
                status: 'CANCELLED',
            });
            await OrderActivityLog.query(trx).insert({
                orderId: id,
                status: 'CANCELLED',
                updatedAt: new Date().toISOString(),
                origin: origins.RESIDENTIAL_APP,
            });
            await ServiceOrderBags.query(trx)
                .where('serviceOrderId', serviceOrder.id)
                .patch({ barcodeStatus: 'CANCELLED', isActiveBarcode: false });
            await trx.commit();
            eventEmitter.emit('indexCustomer', serviceOrder.storeCustomerId);

            res.status(200).json({
                success: true,
            });
            return;
        }

        res.status(404).json({
            error: 'Unable to find the order',
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = cancelOrder;

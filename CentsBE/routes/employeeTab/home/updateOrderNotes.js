const { transaction } = require('objection');

const ServiceOrder = require('../../../models/serviceOrders');
const getSingleOrderLogic = require('../../../uow/singleOrder/getSingleOrderLogicUOW');
const updateStoreCustomerNotes = require('../../../uow/customer/updateNotes');
const eventEmitter = require('../../../config/eventEmitter');

async function updateOrderNotes(req, res, next) {
    let trx = null;

    try {
        trx = await transaction.start(ServiceOrder.knex());

        const { notes, orderId, customerPreferences } = req.body;

        const order = await ServiceOrder.query(trx)
            .findById(orderId)
            .patch({
                notes,
            })
            .returning('*');

        await updateStoreCustomerNotes({
            transaction: trx,
            storeCustomerId: order.storeCustomerId,
            customerNotes: customerPreferences,
        });
        eventEmitter.emit('indexCustomer', order.storeCustomerId);

        await trx.commit();

        const orderDetails = await getSingleOrderLogic(order.id, req.currentStore);
        res.status(200).json({
            ...orderDetails,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = updateOrderNotes;

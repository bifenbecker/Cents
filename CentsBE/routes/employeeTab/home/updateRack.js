const { transaction } = require('objection');
const ServiceOrder = require('../../../models/serviceOrders');

async function updateRack(req, res, next) {
    let trx = null;
    try {
        trx = await transaction.start(ServiceOrder.knex());
        const { rack, id } = req.body;
        await ServiceOrder.query(trx)
            .findById(id)
            .patch({
                rack,
            })
            .returning('id');
        await trx.commit();
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}
module.exports = exports = updateRack;

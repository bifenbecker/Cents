const { transaction } = require('objection');
const PromotionProgramItem = require('../../../../models/promotionProgramItem');
const ServicesMaster = require('../../../../models/services');

async function archiveService(req, res, next) {
    let trx = null;
    try {
        const { serviceId } = req.params;
        let servicesMaster = await ServicesMaster.query().findById(serviceId);
        if (servicesMaster) {
            trx = await transaction.start(PromotionProgramItem.knex());
            servicesMaster = await ServicesMaster.query(trx)
                .patch({
                    isDeleted: !servicesMaster.isDeleted,
                    deletedAt: !servicesMaster.isDeleted ? new Date().toISOString() : null,
                })
                .returning('id')
                .findById(serviceId);
            await PromotionProgramItem.query(trx)
                .patch({
                    isDeleted: true,
                })
                .where({
                    promotionItemType: 'ServicesMaster',
                    promotionItemId: servicesMaster.id,
                });
            await trx.commit();
            res.status(200).json({
                success: true,
            });
        } else {
            res.status(404).json({
                error: 'service not found',
            });
        }
    } catch (error) {
        if (trx) {
            trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = archiveService;

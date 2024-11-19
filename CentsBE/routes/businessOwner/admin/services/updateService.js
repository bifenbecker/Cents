const { transaction } = require('objection');

const ServicesMaster = require('../../../../models/services');

async function updateService(req, res, next) {
    let trx = null;
    try {
        trx = await transaction.start(ServicesMaster.knex());

        const updatedService = await ServicesMaster.query(trx)
            .withGraphFetched('[prices(notDeleted).[store(storeName)], pricingStructure]')
            .modifiers({
                storeName: (query) => {
                    query.select('name');
                },
                notDeleted: (query) => {
                    query.where('deletedAt', null);
                },
            })
            .patch({
                description: req.body.description,
                hasMinPrice: req.body.hasMinPrice,
                name: req.body.name,
                serviceCategoryId: req.body.serviceCategoryId,
                servicePricingStructureId: req.body.servicePricingStructureId,
                piecesCount: req.body.piecesCount,
            })
            .findById(req.body.id)
            .returning('*');

        await trx.commit();

        return res.status(200).json({
            success: true,
            service: updatedService,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

module.exports = exports = updateService;

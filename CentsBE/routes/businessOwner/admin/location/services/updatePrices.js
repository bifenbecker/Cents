const { transaction } = require('objection');
const ServicePrices = require('../../../../../models/servicePrices');
const { serviceListingQuery } = require('./serviceList');

function updatedServicesList(services) {
    return services.map((service) => {
        const resp = { ...service };
        delete resp.id;
        return resp;
    });
}

async function updateServices(req, res, next) {
    let trx = null;
    try {
        trx = await transaction.start(ServicePrices.knex());
        const { data } = req.constants;
        // soft delete existing prices.
        await ServicePrices.query(trx)
            .patch({
                deletedAt: new Date().toISOString(),
            })
            .where('storeId', req.body.storeId)
            .andWhere('deletedAt', null);
        // add the incoming prices to db.
        await ServicePrices.query(trx).insert(updatedServicesList(data));
        await trx.commit();
        const services = await serviceListingQuery(req.body.storeId);
        res.status(200).json({
            success: true,
            services,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = updateServices;

const { transaction } = require('objection');
const StoreCustomer = require('../../../models/storeCustomer');

async function editStorePreferences(req, res, next) {
    let trx = null;
    const centsCustomerId = parseInt(req.params.id, 10);
    const businessId = parseInt(req.params.businessId, 10);
    const storeId = parseInt(req.params.storeId, 10);

    try {
        trx = await transaction.start(StoreCustomer.knex());
        const patchPayload = req.body;
        const result = await StoreCustomer.query(trx).patch(patchPayload).where({
            businessId,
            centsCustomerId,
            storeId,
        });

        if (!result) {
            await trx.rollback();
            res.status(404).json({
                error: `Failed to patch store-customer entity with businessId ${businessId} and centsCustomerId ${centsCustomerId}`,
            });
        } else {
            await trx.commit();
            res.status(201).json({
                success: true,
            });
        }
    } catch (e) {
        if (trx) {
            await trx.rollback();
        }
        next(e);
    }
}

module.exports = exports = editStorePreferences;

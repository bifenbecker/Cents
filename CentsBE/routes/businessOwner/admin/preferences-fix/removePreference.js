const getBusiness = require('../../../../utils/getBusiness');
const BusinessCustomerPreferences = require('../../../../models/businessCustomerPreferences');

async function removePreference(req, res, next) {
    let trx = null;
    try {
        const business = await getBusiness(req);
        const id = parseInt(req.params.id, 10);
        const businessId = parseInt(req.params.businessId, 10);
        if (business.id === businessId) {
            trx = await BusinessCustomerPreferences.startTransaction();
            const preference = await BusinessCustomerPreferences.query(trx)
                .findById(id)
                .patch({
                    deletedAt: new Date().toISOString(),
                    isDeleted: true,
                })
                .returning('*');

            await trx.commit();

            if (!preference) {
                res.status(422).json({
                    error: `No existing businessCustomerPreferences with id ${id}`,
                });
            } else {
                res.status(200).json({
                    success: true,
                    preference,
                });
            }
        } else {
            res.status(404).json({ error: `No business with id ${businessId} found` });
        }
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = removePreference;

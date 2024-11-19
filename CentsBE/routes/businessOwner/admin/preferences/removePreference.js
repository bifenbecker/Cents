const { transaction } = require('objection');
const getBusiness = require('../../../../utils/getBusiness');
const Preferences = require('../../../../models/customerPrefOptions');

async function removePreference(req, res, next) {
    let trx = null;
    try {
        const business = await getBusiness(req);
        const id = parseInt(req.params.id, 10);
        const businessId = parseInt(req.params.businessId, 10);
        if (business.id === businessId) {
            trx = await transaction.start(Preferences.knex());
            const preference = await Preferences.query(trx)
                .patch({ deletedAt: new Date().toISOString() })
                .findById(id)
                .returning('*');
            await trx.commit();
            if (!preference) {
                res.status(404).json({ error: `No existing preference with id ${id}` });
            } else {
                res.status(200).json({ success: true, preference });
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

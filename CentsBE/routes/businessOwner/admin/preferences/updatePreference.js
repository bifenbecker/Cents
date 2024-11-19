const { transaction } = require('objection');
const getBusiness = require('../../../../utils/getBusiness');
const Preferences = require('../../../../models/customerPrefOptions');

async function updatePreference(req, res, next) {
    let trx = null;
    try {
        const business = await getBusiness(req);
        const id = parseInt(req.params.id, 10);
        const businessId = parseInt(req.params.businessId, 10);
        if (business.id === businessId) {
            trx = await transaction.start(Preferences.knex());
            const preference = req.body;
            preference.options = JSON.stringify(preference.options);
            const updatedPref = await Preferences.query(trx).patchAndFetchById(id, preference);
            await trx.commit();
            if (!updatedPref) {
                res.status(404).json({ error: `No preference options with id ${id} found` });
            } else {
                res.status(200).json({ success: true, preference: updatedPref });
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

module.exports = exports = updatePreference;

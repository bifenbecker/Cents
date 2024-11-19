const { transaction } = require('objection');
const Preferences = require('../../../../models/customerPrefOptions');
const getBusiness = require('../../../../utils/getBusiness');

async function createPreferences(req, res, next) {
    let trx = null;
    try {
        const business = await getBusiness(req);
        const newPreferences = req.body.map((pref) => {
            pref.businessId = business.id;
            pref.options = JSON.stringify(pref.options);
            return pref;
        });
        trx = await transaction.start(Preferences.knex());
        const preferences = await Preferences.query(trx).insert(newPreferences);
        await trx.commit();
        res.status(201).json({
            success: true,
            preferences,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = createPreferences;

const Preferences = require('../../../../models/customerPrefOptions');
const getBusiness = require('../../../../utils/getBusiness');

async function getPreferences(req, res, next) {
    try {
        const business = await getBusiness(req);
        const preferences = await Preferences.query().where({
            businessId: business.id,
            deletedAt: null,
        });
        res.status(200).json({
            success: true,
            preferences,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getPreferences;

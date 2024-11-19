const BusinessCustomerPreferences = require('../../../../models/businessCustomerPreferences');
const getBusiness = require('../../../../utils/getBusiness');
const PreferenceOptions = require('../../../../models/preferenceOptions');

async function getPreferences(req, res, next) {
    try {
        const business = await getBusiness(req);
        const preferences = await BusinessCustomerPreferences.query().where({
            businessId: business.id,
            deletedAt: null,
        });

        for (const pref of preferences) {
            pref.options = await PreferenceOptions.query()
                .where({
                    businessCustomerPreferenceId: pref.id,
                    deletedAt: null,
                })
                .orderBy('value', 'asc');
        }

        res.status(200).json({
            success: true,
            preferences,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getPreferences;

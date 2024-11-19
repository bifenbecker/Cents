const BusinessSettings = require('../../models/businessSettings');
const url = require('../urlShortener');

async function getSettings(store) {
    try {
        let termsOfServiceUrl = '';
        const settings = await BusinessSettings.query().findOne({ businessId: store.businessId });

        if (settings.isCustomUrl) {
            termsOfServiceUrl = await url(settings.termsOfServiceUrl);
        }

        return {
            termsOfServiceUrl,
            isCustomUrl: settings.isCustomUrl,
        };
    } catch (error) {
        throw new Error(error);
    }
}
module.exports = getSettings;

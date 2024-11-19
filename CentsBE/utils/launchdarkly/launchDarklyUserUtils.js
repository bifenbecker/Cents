const BusinessSettings = require('../../models/businessSettings');

/**
 * Set a user with businessId as key and custom attribute
 * to be used for flag evaulation with LaunchDarkly
 *
 * @param {Number} businessId
 */
function setBusinessIdUserAttribute(businessId) {
    const featureFlagUser = {
        key: businessId,
        custom: {
            businessId,
        },
    };
    return featureFlagUser;
}

async function getCents20Flag(apiVersion, businessId) {
    const businessSettings = await BusinessSettings.query().findOne({ businessId });
    const hasDryCleaningEnabled = !!businessSettings?.dryCleaningEnabled;
    return apiVersion >= '2.0.0' && hasDryCleaningEnabled;
}

module.exports = exports = {
    setBusinessIdUserAttribute,
    getCents20Flag,
};

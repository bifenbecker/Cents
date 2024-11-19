const getBusiness = require('../../../utils/getBusiness');
const CustomerPreferences = require('../../../models/customerPreferences');
const CustomerPrefOptions = require('../../../models/customerPrefOptions');

async function getCustomerPreferenceChoices(req, res, next) {
    try {
        const { customerId } = req.query;
        const business = await getBusiness(req);

        if (business && typeof customerId !== 'undefined') {
            const preferencesPromise = CustomerPrefOptions.query().where({
                businessId: business.id,
            });
            const choicesPromise = CustomerPreferences.query().where({
                businessId: business.id,
                customerId,
            });

            const [preferences, choices] = await Promise.all([preferencesPromise, choicesPromise]);
            const result = [];
            preferences.forEach((pref) => {
                const selection = choices.find((choice) => choice.optionId === pref.id);
                if (selection) {
                    result.push({
                        preferenceName: pref.fieldName,
                        choice: selection.choice,
                    });
                }
            });

            res.status(200).json({
                success: true,
                choices: result,
            });
        } else {
            res.status(400).json({
                error: 'invalid businessId or customerId params',
            });
        }
    } catch (e) {
        next(e);
    }
}

module.exports = getCustomerPreferenceChoices;

const CustomerPrefOptions = require('../../../models/customerPrefOptions');
const CustomerPreferences = require('../../../models/customerPreferences');

async function getCustomerPreferenceChoices(req, res, next) {
    try {
        const { id: customerId, businessId } = req.params;
        if (typeof customerId !== 'undefined' && typeof businessId !== 'undefined') {
            const preferencesPromise = CustomerPrefOptions.query().where({ businessId });
            const choicesPromise = CustomerPreferences.query().where({
                businessId,
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

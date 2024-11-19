const BusinessCustomerPreferences = require('../../../../models/businessCustomerPreferences');
const CustomerPreferencesOptionSelection = require('../../../../models/customerPreferencesOptionSelection');
const PreferenceOptions = require('../../../../models/preferenceOptions');

async function getCustomerPreferencesChoices(req, res, next) {
    const { id: centsCustomerId, businessId } = req.params;

    try {
        if (typeof businessId !== 'undefined' && typeof centsCustomerId !== 'undefined') {
            const [preferencesQueryResult, customerSelectionQueryResult] = await Promise.all([
                BusinessCustomerPreferences.query().where({
                    businessId,
                    deletedAt: null,
                }),
                CustomerPreferencesOptionSelection.query().where({
                    centsCustomerId,
                    deletedAt: null,
                }),
            ]);

            for (const pref of preferencesQueryResult) {
                const options = await PreferenceOptions.query()
                    .where({
                        businessCustomerPreferenceId: pref.id,
                        deletedAt: null,
                    })
                    .orderBy('value', 'asc');
                pref.options = options;

                pref.options.forEach((option) => {
                    const optionSelectionFound = customerSelectionQueryResult.find(
                        (customerSelection) => customerSelection.preferenceOptionId === option.id,
                    );
                    option.selected = !!optionSelectionFound;
                    if (option.selected) {
                        option.selectionId = optionSelectionFound.id;
                    }
                });
            }

            res.status(200).json({
                success: true,
                preferences: preferencesQueryResult,
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

module.exports = exports = getCustomerPreferencesChoices;

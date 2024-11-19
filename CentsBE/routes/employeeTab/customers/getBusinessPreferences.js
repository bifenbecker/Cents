const BusinessCustomerPreferences = require('../../../models/businessCustomerPreferences');
const CustomerPreferencesOptionSelection = require('../../../models/customerPreferencesOptionSelection');
const PreferenceOptions = require('../../../models/preferenceOptions');

async function getBusinessPreferences(req, res, next) {
    const businessId = parseInt(req.params.businessId, 10);
    const customerId = parseInt(req.params.id, 10);
    try {
        const choices = [];

        if (typeof businessId !== 'undefined' && typeof customerId !== 'undefined') {
            const [preferencesQueryResult, customerSelectionQueryResult] = await Promise.all([
                BusinessCustomerPreferences.query().where({
                    businessId,
                    deletedAt: null,
                }),
                CustomerPreferencesOptionSelection.query().where({
                    centsCustomerId: customerId,
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
                        option.choice = option.value;
                        option.optionId = option.id;
                        choices.push(option);
                    }
                });
            }

            res.status(200).json({
                success: true,
                preferences: preferencesQueryResult,
                choices,
            });
        } else {
            res.status(400).json({
                error: 'invalid businessId or customerId params',
            });
        }
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getBusinessPreferences;

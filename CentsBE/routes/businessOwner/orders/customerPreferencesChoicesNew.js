const getBusiness = require('../../../utils/getBusiness');
const BusinessCustomerPreferences = require('../../../models/businessCustomerPreferences');
const PreferenceOptions = require('../../../models/preferenceOptions');
const CustomerPreferencesOptionSelection = require('../../../models/customerPreferencesOptionSelection');

async function getCustomerPreferenceChoices(req, res, next) {
    try {
        const { customerId } = req.query;
        const business = await getBusiness(req);

        if (business && typeof customerId !== 'undefined') {
            const [preferencesQueryResult, customerSelectionQueryResult] = await Promise.all([
                BusinessCustomerPreferences.query().where({
                    businessId: business.id,
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

module.exports = getCustomerPreferenceChoices;

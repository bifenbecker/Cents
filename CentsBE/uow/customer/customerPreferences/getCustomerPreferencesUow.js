const CustomerPreferencesOptionSelection = require('../../../models/customerPreferencesOptionSelection');

async function getCustomerPreferences(payload) {
    try {
        const newPayload = payload;
        const { businessId, centsCustomerId } = payload;

        const customerPreferences = await CustomerPreferencesOptionSelection.query()
            .withGraphFetched(
                'preferenceOption(notDeletedAtFilter).businessPreference(notDeletedAtFilter, businessFilter)',
            )
            .where({
                centsCustomerId,
                deletedAt: null,
            })
            .modifiers({
                notDeletedAtFilter: (query) => {
                    query.where('deletedAt', null);
                },
                businessFilter: (query) => {
                    query.where('businessId', businessId);
                },
            });

        const formattedCustomerPreferences = {};
        customerPreferences.forEach((optionSelection) => {
            const { preferenceOption } = optionSelection;
            const { businessPreference } = preferenceOption;

            if (!businessPreference) return;

            if (businessPreference.id in formattedCustomerPreferences) {
                formattedCustomerPreferences[businessPreference.id].values.push(
                    preferenceOption.value,
                );
            } else {
                formattedCustomerPreferences[businessPreference.id] = {
                    label: businessPreference.fieldName,
                    values: [preferenceOption.value],
                };
            }
        });

        newPayload.customerPreferences = Object.values(formattedCustomerPreferences);

        return newPayload;
    } catch (e) {
        throw new Error(e);
    }
}

module.exports = exports = getCustomerPreferences;

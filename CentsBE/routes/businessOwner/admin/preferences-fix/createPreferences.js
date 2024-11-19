const getBusiness = require('../../../../utils/getBusiness');
const BusinessCustomerPreferences = require('../../../../models/businessCustomerPreferences');
const PreferenceOptions = require('../../../../models/preferenceOptions');

async function createPreference(req, res, next) {
    let trx = null;

    try {
        const business = await getBusiness(req);
        const preferencesPayload = req.body;
        const responsePayload = [];

        trx = await BusinessCustomerPreferences.startTransaction();

        for (const preference of preferencesPayload) {
            const queryResponse = await BusinessCustomerPreferences.query(trx).insertAndFetch({
                businessId: business.id,
                fieldName: preference.fieldName,
                type: preference.type,
            });

            preference.options.forEach((option) => {
                option.businessCustomerPreferenceId = queryResponse.id;
            });

            queryResponse.options = await PreferenceOptions.query(trx).insertAndFetch(
                preference.options,
            );

            responsePayload.push(queryResponse);
        }

        await trx.commit();
        res.status(201).json({
            success: true,
            preferences: responsePayload,
        });
    } catch (e) {
        if (trx) {
            trx.rollback(e);
        }
        next(e);
    }
}

module.exports = exports = createPreference;

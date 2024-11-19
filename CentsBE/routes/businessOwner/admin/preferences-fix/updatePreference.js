const BusinessCustomerPreferences = require('../../../../models/businessCustomerPreferences');
const CustomerPreferencesOptionSelection = require('../../../../models/customerPreferencesOptionSelection');
const PreferenceOption = require('../../../../models/preferenceOptions');

/**
 * Marking an individual CustomerPreferenceOptionSelection as deleted when
 * changing a BusinessCustomerPreference from 'multi' to 'single'
 *
 * @param {Object} preferenceOption
 * @param {void} transaction
 */
async function deleteSelectionForCustomer(preferenceOption, transaction) {
    const updatedCustomerSelection = await CustomerPreferencesOptionSelection.query(transaction)
        .patch({
            deletedAt: new Date().toISOString(),
            isDeleted: true,
        })
        .where({
            preferenceOptionId: preferenceOption.id,
        })
        .returning('*');
    return updatedCustomerSelection;
}

async function updatePreference(req, res, next) {
    let trx = null;
    try {
        const { business, businessCustomerPreferenceBeforeUpdate } = req.constants;
        const businessId = parseInt(req.params.businessId, 10);
        const preferenceId = parseInt(req.params.id, 10);
        if (business.id === businessId) {
            trx = await BusinessCustomerPreferences.startTransaction();

            const preference = req.body;
            const updatedPref = await BusinessCustomerPreferences.query(trx).patchAndFetchById(
                preferenceId,
                preference,
            );
            if (
                preference.type === 'single' &&
                businessCustomerPreferenceBeforeUpdate.type === 'multi'
            ) {
                const preferenceOptions = await PreferenceOption.query(trx).where({
                    businessCustomerPreferenceId: businessCustomerPreferenceBeforeUpdate.id,
                });
                const updatedCustomerOptions = preferenceOptions.map((preferenceOption) =>
                    deleteSelectionForCustomer(preferenceOption, trx),
                );
                await Promise.all(updatedCustomerOptions);
            }
            await trx.commit();
            if (!updatedPref) {
                res.status(422).json({
                    error: `No customer preference with id ${preference.id} found`,
                });
            } else {
                res.status(200).json({
                    success: true,
                    preference: updatedPref,
                });
            }
        } else {
            res.status(422).json({ error: `No business with id ${businessId} found` });
        }
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = updatePreference;

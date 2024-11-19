const { transaction } = require('objection');
const CustomerPreferencesOptionSelection = require('../../../../models/customerPreferencesOptionSelection');

async function updatePreferenceOptionSelection(req, res, next) {
    let trx = null;
    const selectionId = parseInt(req.params.selectionId, 10);
    const { newOptionId } = req.body;
    try {
        trx = await transaction.start(CustomerPreferencesOptionSelection.knex());
        const queryResponse = await CustomerPreferencesOptionSelection.query().patchAndFetchById(
            selectionId,
            { preferenceOptionId: newOptionId },
        );

        await trx.commit();

        if (!queryResponse) {
            res.status(422).json({
                error: `No customer selection with id  ${selectionId} found`,
            });
        } else {
            res.status(201).json({
                success: true,
                selection: queryResponse,
            });
        }
    } catch (e) {
        if (trx) {
            await trx.rollback();
        }
        next(e);
    }
}

module.exports = exports = updatePreferenceOptionSelection;

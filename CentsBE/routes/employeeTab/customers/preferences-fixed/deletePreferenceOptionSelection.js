const { transaction } = require('objection');
const CustomerPreferencesOptionSelection = require('../../../../models/customerPreferencesOptionSelection');

async function deletePreferenceOptionSelection(req, res, next) {
    let trx = null;
    try {
        const selectionId = parseInt(req.params.selectionId, 10);
        trx = await transaction.start(CustomerPreferencesOptionSelection.knex());
        const selection = await CustomerPreferencesOptionSelection.query(trx)
            .findById(selectionId)
            .patch({
                deletedAt: new Date().toISOString(),
                isDeleted: true,
            })
            .returning('*');

        await trx.commit();

        if (!selection) {
            res.status(422).json({
                error: `No existing customerPreferencesOptionSelection with id ${selectionId}`,
            });
        } else {
            res.status(200).json({
                success: true,
                selection,
            });
        }
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = deletePreferenceOptionSelection;

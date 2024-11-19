const { transaction } = require('objection');
const CustomerPreferencesOptionSelection = require('../../../../models/customerPreferencesOptionSelection');

async function createPreferenceOptionSelection(req, res, next) {
    const { id: centsCustomerId } = req.params;

    if (typeof centsCustomerId === 'undefined') {
        res.status(400).json({
            error: `Undefined cents customer id`,
        });
        return;
    }

    let trx = null;

    try {
        const { preferenceOptionId } = req.body;
        trx = await transaction.start(CustomerPreferencesOptionSelection.knex());
        const queryResponse = await CustomerPreferencesOptionSelection.query(trx).insertAndFetch({
            centsCustomerId,
            preferenceOptionId,
        });

        await trx.commit();
        res.status(201).json({
            success: true,
            selection: queryResponse,
        });
    } catch (e) {
        if (trx) {
            await trx.rollback();
        }
        next(e);
    }
}

module.exports = exports = createPreferenceOptionSelection;

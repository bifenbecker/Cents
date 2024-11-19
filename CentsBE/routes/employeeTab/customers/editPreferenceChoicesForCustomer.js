const { transaction } = require('objection');
const CustomerPreferences = require('../../../models/customerPreferences');

async function editPreferenceChoicesForCustomer(req, res, next) {
    let trx = null;
    try {
        trx = await transaction.start(CustomerPreferences.knex());
        const customerPreference = req.body;
        const result = await CustomerPreferences.query(trx).patchAndFetchById(
            customerPreference.id,
            customerPreference,
        );

        if (!result) {
            await trx.rollback();
            res.status(404).json({
                error: `No customer preference with id ${customerPreference.id} found`,
            });
        } else {
            await trx.commit();
            res.status(201).json({
                success: true,
                choice: result,
            });
        }
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = editPreferenceChoicesForCustomer;

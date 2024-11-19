const { transaction } = require('objection');
const CustomerPreferences = require('../../../models/customerPreferences');

async function addPreferenceChoicesForCustomer(req, res, next) {
    const { id: customerId } = req.params;
    const businessId = parseInt(req.params.businessId, 10);
    let trx = null;
    try {
        trx = await transaction.start(CustomerPreferences.knex());
        const newChoice = req.body;
        newChoice.customerId = customerId;
        newChoice.businessId = businessId;
        const result = await CustomerPreferences.query(trx).insert(newChoice);
        await trx.commit();
        res.status(201).json({
            success: true,
            choice: result,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = addPreferenceChoicesForCustomer;

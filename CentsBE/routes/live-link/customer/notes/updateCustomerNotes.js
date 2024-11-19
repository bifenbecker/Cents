const { transaction } = require('objection');
const StoreCustomer = require('../../../../models/storeCustomer');

/**
 * Update the customer preferences / hang dry instructions for a given StoreCustomer
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateCustomerNotes(req, res, next) {
    let trx;

    try {
        const { params, body } = req;
        const { storeCustomerId } = params;
        const { notes, hangDryInstructions, isHangDrySelected } = body;

        trx = await transaction.start(StoreCustomer.knex());

        const storeCustomer = await StoreCustomer.query(trx)
            .patch({
                notes,
                hangDryInstructions,
                isHangDrySelected,
            })
            .findById(storeCustomerId)
            .returning('*');

        await trx.commit();

        return res.status(200).json({
            success: true,
            customer: storeCustomer,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

module.exports = exports = updateCustomerNotes;

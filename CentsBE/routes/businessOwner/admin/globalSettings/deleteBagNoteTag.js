const { transaction } = require('objection');
const BagNoteTag = require('../../../../models/bagNoteTag');

/**
 * Mark an incoming BagNoteTag as "deleted"
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function deleteBagNoteTag(req, res, next) {
    let trx = null;

    try {
        const { id } = req.params;

        trx = await transaction.start(BagNoteTag.knex());

        await BagNoteTag.query(trx)
            .patch({
                isDeleted: true,
                deletedAt: new Date().toISOString(),
            })
            .findById(id);

        await trx.commit();

        return res.json({
            success: true,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

module.exports = exports = deleteBagNoteTag;

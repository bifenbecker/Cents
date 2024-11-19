const BagNoteTag = require('../../../models/bagNoteTag');

/**
 * Get a list of all BagNoteTag entries for a given business
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getAllBagNoteTags(req, res, next) {
    try {
        const { currentStore } = req;

        const bagNoteTags = await BagNoteTag.query().where({
            businessId: currentStore.businessId,
            isDeleted: false,
        });

        return res.json({
            success: true,
            bagNoteTags,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = {
    getAllBagNoteTags,
};

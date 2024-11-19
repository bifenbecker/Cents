const Store = require('../../../models/store');

/**
 * Update the printerConnectionType in the Store model
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function savePrinterSettings(req, res, next) {
    try {
        const { printerConnectionType } = req.body;
        const { id } = req.currentStore;

        const store = await Store.query()
            .patch({ printerConnectionType })
            .findById(id)
            .returning('*');

        return res.json({
            success: true,
            printerConnectionType: store.printerConnectionType,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = { savePrinterSettings };

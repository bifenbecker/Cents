const EsdReader = require('../../../models/esdReader');

async function getEsdReaderForStore(req, res, next) {
    try {
        const store = req.currentStore;
        const reader = await EsdReader.query().where('storeId', store.id).first();

        return res.status(200).json({
            success: true,
            reader,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = getEsdReaderForStore;

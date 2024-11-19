const StoresListPipeline = require('../../../pipeline/driverApp/storesListPipeline');

async function getStoresList(req, res, next) {
    try {
        const { decodedToken } = req.locals || {};
        const storeList = await StoresListPipeline({ userId: decodedToken.id });
        res.status(200).json({
            success: true,
            stores: storeList,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getStoresList;

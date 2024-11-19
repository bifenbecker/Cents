const {
    fetchInventoryForStore,
} = require('../../../services/inventory/queries/fetchInventoryForStore');

async function getInventoryForStore(req, res, next) {
    try {
        const { orderId, centsCustomerId } = req.query;
        const [inventoryPrice, categories] = await fetchInventoryForStore(
            req.currentStore,
            orderId,
            centsCustomerId,
        );

        res.status(200).json({
            success: true,
            inventoryPrice,
            inventoryCategories: categories,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getInventoryForStore;

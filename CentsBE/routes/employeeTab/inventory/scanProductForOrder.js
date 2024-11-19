const Inventory = require('../../../models/inventory');
const InventoryItem = require('../../../models/inventoryItem');

/**
 * Retrieve an individual product based on SKU
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function scanProductForOrder(req, res, next) {
    try {
        const { sku } = req.query;
        const { currentStore } = req;

        const product = await Inventory.query().withGraphJoined('inventoryCategory').findOne({
            sku,
            'inventoryCategory.businessId': currentStore.businessId,
        });

        if (!product) {
            return res.status(422).json({
                error: "A product with the SKU you scanned doesn't exist in the Cents system.",
            });
        }

        const storeSpecificItem = await InventoryItem.query().findOne({
            inventoryId: product.id,
            storeId: currentStore.id,
        });

        if (!storeSpecificItem) {
            return res.status(422).json({
                error: 'The product you scanned is not available at your current location.',
            });
        }

        const inventoryItem = {
            priceId: storeSpecificItem.id,
            price: storeSpecificItem.price,
            storeId: currentStore.id,
            quantity: storeSpecificItem.quantity,
            lineItemName: product.productName,
            inventoryImage: product.productImage,
            description: product.description,
            inventoryCategory: product.inventoryCategory.name,
            isTaxable: product.isTaxable,
            lineItemType: 'INVENTORY',
            productId: product.id,
        };

        return res.status(200).json({
            success: true,
            inventoryItem,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = scanProductForOrder;

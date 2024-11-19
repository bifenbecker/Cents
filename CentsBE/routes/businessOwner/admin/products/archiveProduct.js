const Inventory = require('../../../../models/inventory');
const InventoryItem = require('../../../../models/inventoryItem');

const archiveModelPipeline = require('../../../../pipeline/archive/archiveModelPipeline');

/**
 * Archive a given product
 *
 * @param {Object} req
 * @param {Objct} res
 * @param {void} next
 */
async function archiveProduct(req, res, next) {
    try {
        const { id } = req.params;
        const { archiveBoolean } = req.body;

        const payload = {
            modelName: Inventory,
            modelChildName: InventoryItem,
            modelId: id,
            archiveBoolean,
        };

        const output = await archiveModelPipeline(payload);

        return res.json({
            success: true,
            output,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = archiveProduct;

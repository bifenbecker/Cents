const Pipeline = require('../pipeline');

// Uows
const retrieveCurrentInventoryItemQuantity = require('../../uow/products/retrieveCurrentInventoryItemQuantityUow');
const updateInventoryItem = require('../../uow/products/updateInventoryItemUow');
const createManualInventoryChangeLog = require('../../uow/products/createManualInventoryChangeLowUow');

/**
 * Update a product's details.
 *
 * The pipeline includes the following:
 *
 * 1) If the field is "quantity", retrieve the current quantity and store it in payload
 * 2) Update the product itself based on the incoming field and value
 * 3) If the field is quantity, create an InventoryChangeLog entry
 *
 * Payload includes:
 *
 * 1) businessId
 * 2) inventoryItemId
 * 3) field
 * 4) value
 *
 * @param {*} payload
 */
async function updateProductPipeline(payload) {
    try {
        const productPipeline = new Pipeline([
            retrieveCurrentInventoryItemQuantity,
            updateInventoryItem,
            createManualInventoryChangeLog,
        ]);
        const output = await productPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateProductPipeline;

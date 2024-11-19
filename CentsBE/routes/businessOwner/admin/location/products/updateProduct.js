const { transaction } = require('objection');
const InventoryItem = require('../../../../../models/inventoryItem');

async function updateProduct(req, res, next) {
    let trx = null;
    try {
        const { store, hasPriceChanged, service } = req.constants;
        if (hasPriceChanged) {
            trx = await transaction.start(InventoryItem.knex());
            // soft delete existing record.
            await InventoryItem.query(trx)
                .patch({
                    isDeleted: true,
                })
                .findById(req.body.id);
            await InventoryItem.query(trx).insert({
                storeId: store.id,
                price: req.body.price,
                quantity: req.body.quantity,
                isFeatured: req.body.isFeatured,
                inventoryId: service.inventoryId,
            });
            await trx.commit();
        } else {
            await InventoryItem.query()
                .patch({
                    storeId: store.id,
                    price: req.body.price,
                    quantity: req.body.quantity,
                    isFeatured: req.body.isFeatured,
                })
                .findById(req.body.id);
        }
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = updateProduct;

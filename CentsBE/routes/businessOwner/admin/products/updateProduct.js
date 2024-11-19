const { transaction } = require('objection');

const Inventory = require('../../../../models/inventory');

async function updateProduct(req, res, next) {
    let trx = null;
    try {
        trx = await transaction.start(Inventory.knex());

        const updatedProduct = await Inventory.query(trx)
            .withGraphFetched('inventoryItems(itemsFilter)')
            .modifiers({
                itemsFilter: (query) => {
                    query.where('deletedAt', null).whereNot({
                        storeId: null,
                    });
                },
            })
            .patchAndFetchById(req.body.id, {
                description: req.body.description,
                productName: req.body.productName,
                productImage: req.body.productImage,
                sku: req.body.sku,
                categoryId: req.body.categoryId,
            });

        await trx.commit();

        if (updatedProduct?.inventoryItems?.length > 0) {
            const prices = [];
            updatedProduct?.inventoryItems?.map((item) => prices.push(item.price));
            const numOfUniquePrices = new Set(prices).size;
            const allEqual = (arr) => arr.every((v) => v === arr[0]);
            const singlePrice = [...new Set(prices)];
            const unique = allEqual(prices);
            updatedProduct.price = unique ? singlePrice[0] : `${numOfUniquePrices} prices`;
        }

        return res.status(200).json({
            success: true,
            product: updatedProduct,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

module.exports = exports = updateProduct;

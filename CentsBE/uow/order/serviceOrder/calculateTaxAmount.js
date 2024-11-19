const InventoryItem = require('../../../models/inventoryItem');
const ServicePrices = require('../../../models/servicePrices');
const StoreQuery = require('../../../queryHelpers/store');

async function calculateTaxAmount(payload) {
    const { transaction, store } = payload;
    let { serviceOrderItems } = payload;
    const newPayload = payload;

    const storeQuery = new StoreQuery(store.id);
    const taxRate = await storeQuery.taxRate();
    const { rate } = taxRate || {};

    serviceOrderItems = await Promise.all(
        serviceOrderItems.map(async (item) => {
            let itemModel;
            if (item.lineItemType === 'SERVICE') {
                itemModel = ServicePrices;
            } else if (item.lineItemType === 'INVENTORY') {
                itemModel = InventoryItem;
            } else if (item.lineItemType && item.lineItemType === 'MODIFIER') {
                item.taxAmountInCents = 0;
                return item;
            }
            const itemDetails = await itemModel.query(transaction).findById(item.priceId);

            let { isTaxable } = itemDetails;

            // Tier pricing services tax should be calulated based on the store configuration
            if (itemDetails.pricingTierId && item.lineItemType === 'SERVICE') {
                const storeItemDetails = await itemModel
                    .query(transaction)
                    .where('serviceId', itemDetails.serviceId)
                    .where('storeId', store.id)
                    .where('deletedAt', null)
                    .first();
                isTaxable = storeItemDetails ? storeItemDetails.isTaxable : false;
            }
            if (itemDetails.pricingTierId && item.lineItemType === 'INVENTORY') {
                const storeItemDetails = await itemModel
                    .query(transaction)
                    .where('inventoryId', itemDetails.inventoryId)
                    .where('storeId', store.id)
                    .where('isDeleted', false)
                    .first();
                isTaxable = storeItemDetails ? storeItemDetails.isTaxable : false;
            }

            if (isTaxable) {
                newPayload.isTaxable = true;
                item.taxAmountInCents = rate
                    ? Math.round(
                          (
                              (item.totalPrice - (item.promotionAmountInCents || 0) / 100) *
                              (rate / 100) *
                              100
                          ).toFixed(2),
                      )
                    : 0;
            } else {
                item.taxAmountInCents = 0;
            }
            return item;
        }),
    );

    const totalTaxAmount = serviceOrderItems.reduce(
        (previous, current) => previous + (current.taxAmountInCents || 0),
        0,
    );
    newPayload.taxAmountInCents = totalTaxAmount;
    return newPayload;
}

module.exports = exports = calculateTaxAmount;

const { task, desc } = require('jake');
const { raw, transaction } = require('objection');

const InventoryOrder = require('../models/inventoryOrders');

const activeInventoryOrderItems = require('../services/orders/queries/currentActiveInventoryOrderItems');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

async function getOrders() {
    const orders = await InventoryOrder.query()
        .select(
            'inventoryOrders.id as id',
            'orderTotal as orderTotal',
            'orderPromoDetails.promoDetails as promoDetails',
            'orderPromoDetails.itemIds as itemIds',
        )
        .join('orders', (builder) => {
            builder
                .on('inventoryOrders.id', '=', 'orders.orderableId')
                .andOn('orders.orderableType', '=', raw("'InventoryOrder'"));
        })
        .join('orderPromoDetails', 'orderPromoDetails.orderId', 'orders.id')
        .whereNotNull('promotionId');
    return orders;
}

function isFixedPriceDiscount(promotionDetails) {
    return promotionDetails.promotionType === 'fixed-price-discount';
}

function itemDiscount(item, discount) {
    const { totalCost } = item;
    return (Number(totalCost) * discount) / 100;
}

function calculateFixedPriceDiscount(order, discount) {
    return discount > order.orderTotal
        ? Number(order.orderTotal.toFixed(2))
        : Number(discount.toFixed(2));
}

function calculateTotalDiscount(matchedItems, discount) {
    let discountAmount = 0;
    matchedItems.forEach((element) => {
        discountAmount += itemDiscount(element, discount);
    });

    return Number(discountAmount.toFixed(2));
}

function calculateItemsDiscount(currentOrderItems, appliedItemIds, promoDetails) {
    const applicableItems = [];
    for (const i of currentOrderItems) {
        const isMatch = appliedItemIds.find((item) => i.id === item);
        if (isMatch) {
            applicableItems.push(i);
        }
    }
    return calculateTotalDiscount(applicableItems, promoDetails.discountValue);
}

async function mapOrder(order, trx) {
    const { itemIds, promoDetails } = order;
    if (isFixedPriceDiscount(promoDetails)) {
        return InventoryOrder.query(trx)
            .patch({
                promotionAmount: calculateFixedPriceDiscount(order, promoDetails.discountValue),
            })
            .findById(order.id);
    }
    let promotionAmount = 0;
    if (promoDetails.appliesToType === 'entire-order') {
        promotionAmount = Number(
            ((Number(order.orderTotal) * Number(promoDetails.discountValue)) / 100).toFixed(2),
        );
    } else {
        const activeOrderItems = await activeInventoryOrderItems(order.id, trx);
        promotionAmount = calculateItemsDiscount(activeOrderItems, itemIds, promoDetails);
    }
    return InventoryOrder.query(trx)
        .patch({
            promotionAmount,
        })
        .findById(order.id);
}

desc('populate promotion amount column in inventory orders');

task('populate_promotion_amount_inventory_order', async () => {
    let trx = null;
    try {
        const orders = await getOrders();
        trx = await transaction.start(InventoryOrder.knex());
        const mappedOrders = orders.map((order) => mapOrder(order, trx));
        await Promise.all(mappedOrders);
        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});

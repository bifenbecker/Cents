const { task, desc } = require('jake');
const { raw, transaction } = require('objection');
const ServiceOrder = require('../models/serviceOrders');

const activeServiceOrderItems = require('../services/orders/queries/currentActiveServiceItems');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc('populate promotionAmount column in serviceOrders table');

async function fetchOrderWithPromotions() {
    const orders = await ServiceOrder.query()
        .select(
            'serviceOrders.id as id',
            'orderPromoDetails.promoDetails as promoDetails',
            'orderTotal as orderTotal',
            'orderPromoDetails.itemIds as itemIds',
        )
        .join('orders', (builder) => {
            builder
                .on('serviceOrders.id', '=', 'orders.orderableId')
                .andOn('orders.orderableType', '=', raw("'ServiceOrder'"));
        })
        .join('orderPromoDetails', 'orderPromoDetails.orderId', 'orders.id')
        .whereNotNull('promotionId');
    return orders;
}

function isFixedPriceDiscount(promotionDetails) {
    return promotionDetails.promotionType === 'fixed-price-discount';
}

function isItemPerPound(item) {
    return item.category === 'PER_POUND';
}

function itemDiscount(item, discount) {
    const { totalCost } = item;
    return (totalCost * discount) / 100;
}

function calculateFixedPriceDiscount(order, discount) {
    return discount > order.orderTotal
        ? Number(order.orderTotal.toFixed(2))
        : Number(discount.toFixed(2));
}

function calculateForModifiers(items, discount) {
    const modifiers = items.filter((item) => item.modifierId !== null);
    let modifiersDiscount = 0;
    modifiers.forEach((element) => {
        modifiersDiscount += itemDiscount(element, discount);
    });
    return modifiersDiscount;
}

function calculateTotalDiscount(matchedItems, discount) {
    let discountAmount = 0;
    matchedItems.forEach((element) => {
        discountAmount += itemDiscount(element, discount);
        if (isItemPerPound(element)) {
            discountAmount += calculateForModifiers(matchedItems, discount);
        }
    });
    return Number(discountAmount.toFixed(2));
}

function calculateItemsDiscount(currentOrderItems, appliedItemIds, promoDetails) {
    const applicableItems = [];
    for (const i of currentOrderItems) {
        const isMatch = appliedItemIds.find((item) => i.serviceReferenceItemDetailsId === item);
        if (isMatch) {
            applicableItems.push(i);
        }
    }
    return calculateTotalDiscount(applicableItems, promoDetails.discountValue);
}

async function mapItem(order, trx) {
    const { itemIds, promoDetails } = order;
    if (isFixedPriceDiscount(promoDetails)) {
        return ServiceOrder.query(trx)
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
        const activeOrderItems = await activeServiceOrderItems(order.id, null, trx);
        promotionAmount = calculateItemsDiscount(activeOrderItems, itemIds, promoDetails);
    }
    return ServiceOrder.query(trx)
        .patch({
            promotionAmount,
        })
        .findById(order.id);
}

task('populate_promotion_amount_service_order', async () => {
    let trx = null;
    try {
        const items = await fetchOrderWithPromotions();
        trx = await transaction.start(ServiceOrder.knex());
        const updateArray = items.map((item) => mapItem(item, trx));
        await Promise.all(updateArray);
        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});

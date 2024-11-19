const getPromotionDetails = require('../../../services/orders/queries/getPromotionDetails');
const OrderPromotionFactory = require('../../../services/orders/factories/orderPromotionCalculatorFactory');
const applyToFixed = require('../../../utils/applyToFixed');

function getUnitPromoAmount(promotionAmount, orderItemsTotal) {
    return promotionAmount / orderItemsTotal;
}

async function calculatePromoAmount(payload) {
    const { promotionId, transaction, orderType, orderItemsTotal, serviceOrderItems } = payload;
    const newPayload = payload;
    if (!promotionId) {
        newPayload.promotionId = null;
        newPayload.promotionAmount = 0;
        newPayload.serviceOrderItems.forEach((item) => {
            item.promotionAmountInCents = 0;
        });
        return newPayload;
    }
    const promotion = await getPromotionDetails(promotionId, transaction);

    const promotionCalculator = new OrderPromotionFactory(
        serviceOrderItems,
        promotion,
        orderItemsTotal,
        { orderType },
    ).calculator();

    let unitPromoAmount = 0;

    let promotionDetails = promotionCalculator.calculate();
    let promotionAmount = applyToFixed(promotionDetails.promoDetails.orderPromotionAmount || 0);
    if (promotionAmount === 0 || promotionDetails.isInvalidPromo) {
        newPayload.promotionId = null;
        newPayload.serviceOrderItems.forEach((item) => {
            item.promotionAmountInCents = 0;
        });
        promotionDetails = null;
        promotionAmount = 0;
    } else if (promotionCalculator.isAppliesToSpecificItems()) {
        // if promo applies to specific items
        // 1. divide the promoamount among the items
        const { applicableItems } = promotionCalculator;
        const totalPrice = applicableItems.reduce(
            (previous, current) => previous + current.totalPrice,
            0,
        );
        unitPromoAmount = getUnitPromoAmount(promotionAmount, totalPrice);
        const applicableItemkeys = applicableItems.map((item) => item.priceId);
        serviceOrderItems.forEach((item) => {
            if (applicableItemkeys.includes(item.priceId)) {
                item.promotionAmountInCents = Math.round(
                    (item.totalPrice * unitPromoAmount * 100).toFixed(2),
                );
            } else {
                item.promotionAmountInCents = 0;
            }
        });
    } else {
        unitPromoAmount = getUnitPromoAmount(promotionAmount, orderItemsTotal);
        serviceOrderItems.forEach((item) => {
            // eslint-disable-next-line no-param-reassign
            if (item.lineItemType !== 'MODIFIER') {
                item.promotionAmountInCents = Math.round(
                    (item.totalPrice * unitPromoAmount * 100).toFixed(2),
                );
            } else {
                item.promotionAmountInCents = 0;
            }
        });
    }

    newPayload.promotionAmount = promotionAmount;
    newPayload.promotionDetails = promotionDetails;
    return newPayload;
}

module.exports = exports = calculatePromoAmount;

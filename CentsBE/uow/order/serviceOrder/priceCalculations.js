const applyToFixed = require('../../../utils/applyToFixed');
const ServicePrices = require('../../../models/servicePrices');

function calculatePerPoundPrice(payload) {
    const { minPrice, modifiers, minQty, storePrice, hasMinPrice, weight } = payload;
    let modifiersPrice = 0;
    let perPoundPrice = 0;
    if (modifiers && modifiers.length > 0) {
        modifiersPrice =
            modifiers.reduce((acc, modifier) => acc + modifier.price, 0) * Number(weight);
        modifiersPrice = Number(modifiersPrice.toFixed(2));
    }
    if (hasMinPrice) {
        perPoundPrice =
            minPrice +
            (Number(weight) > minQty ? (Number(weight) - Number(minQty)) * storePrice : 0);
        perPoundPrice = Number(perPoundPrice.toFixed(2));
    } else {
        perPoundPrice = Number((weight * storePrice).toFixed(2));
    }
    return Math.round((perPoundPrice + modifiersPrice) * 100) / 100;
}

async function getPrice(payload) {
    const {
        priceId,
        count,
        modifiers,
        transaction,
        hasMinPrice,
        lineItemType,
        perItemPrice,
        weight,
        pricingType,
    } = payload;
    if (lineItemType === 'SERVICE') {
        const { storePrice, minQty, minPrice } = await ServicePrices.query(transaction).findById(
            priceId,
        );
        if (pricingType === 'PER_POUND') {
            return calculatePerPoundPrice({
                storePrice,
                minQty,
                minPrice,
                modifiers,
                hasMinPrice,
                weight,
            });
        }
        return applyToFixed(Number(storePrice) * Number(count));
    }
    return perItemPrice * count;
}

module.exports = {
    getPrice,
};

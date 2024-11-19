function calculatePerPoundPrice(price, totalWeight, flatRateWeight, flatPrice, hasMinPrice) {
    if (totalWeight === 0) {
        return 0;
    }
    if (price === 0 && !hasMinPrice) {
        return 0;
    }
    if (hasMinPrice) {
        // if there is minimum price then calculate the price for both
        const remainingWeight = totalWeight - flatRateWeight;

        let variablePrice = 0;

        if (remainingWeight > 0) {
            variablePrice = price * remainingWeight;
        }

        return (flatPrice + variablePrice).toFixed(2);
    }
    return price * totalWeight;
}
module.exports = exports = calculatePerPoundPrice;

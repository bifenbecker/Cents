/**
 * Map our incoming promotion request to valid balance and redemption rules
 * @param {Number} discountValue
 * @param {String} promotionType
 * @param {Object} minRequirements
 */
async function mapLightrailRules(discountValue, promotionType, minRequirements) {
    let balanceRule = {};
    let redemptionRule = {};

    switch (promotionType) {
        case 'fixed-price-discount':
            balanceRule.rule = `serviceOrder.orderTotal - ${discountValue}`;
            balanceRule.explanation = `$${discountValue} off order total`;
            break;
        case 'percentage-discount':
            balanceRule.rule = `serviceOrder.orderTotal * ${discountValue / 100}`;
            balanceRule.explanation = `${discountValue}% off order total`;
            break;
        default:
            balanceRule = null;
            break;
    }

    switch (minRequirements.requirementType) {
        case 'min-purchase-amount':
            redemptionRule.rule = `serviceOrder.total > ${minRequirements.requirementValue}`;
            redemptionRule.explanation = `Order total must be greater than $${minRequirements.requirementValue}`;
            break;
        case 'min-quantity':
            redemptionRule.rule = `orderItems.length > $${minRequirements.requirementValue}`;
            redemptionRule.explanation = `Total items in order must be greater than ${minRequirements.requirementValue}`;
            break;
        case 'none':
            redemptionRule = null;
            break;
        default:
            redemptionRule = null;
            break;
    }

    return [balanceRule, redemptionRule];
}

function getDiscountValue(discount) {
    return Number.isInteger(discount) ? discount : discount.toFixed(2);
}
module.exports = exports = { mapLightrailRules, getDiscountValue };

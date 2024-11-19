const BasePromotionCalculator = require('./baseOrderPromotionCalculator');

class InventoryOrderPromotionCalculator extends BasePromotionCalculator {
    addApplicableItemId(item) {
        this.applicableItemIds.push(item.id);
    }

    addOrderableType() {
        this.orderPromoDetails.orderableType = 'InventoryOrder';
    }
}

module.exports = exports = InventoryOrderPromotionCalculator;

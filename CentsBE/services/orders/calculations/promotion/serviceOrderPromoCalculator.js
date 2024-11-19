const BasePromotionCalculator = require('./baseOrderPromotionCalculator');

class ServiceOrderPromotionCalculator extends BasePromotionCalculator {
    addApplicableItemId(item) {
        this.applicableItemIds.push(item.serviceReferenceItemDetailsId);
    }

    addOrderableType() {
        this.orderPromoDetails.orderableType = 'ServiceOrder';
    }
}

module.exports = exports = ServiceOrderPromotionCalculator;

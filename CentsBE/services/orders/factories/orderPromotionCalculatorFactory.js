const InventoryOrderPromotionCalculator = require('../calculations/promotion/inventoryOrderPromotionCalculator');
const ServiceOrderPromotionCalculator = require('../calculations/promotion/serviceOrderPromoCalculator');

class OrderPromotionFactory {
    constructor(orderItems, promotionDetails, orderTotal, payload) {
        this.orderItems = orderItems;
        this.promotionDetails = promotionDetails;
        this.orderTotal = orderTotal;
        this.payload = payload;
    }

    calculator() {
        const { orderType } = this.payload;
        if (orderType === 'ServiceOrder') {
            return new ServiceOrderPromotionCalculator(
                this.orderItems,
                this.promotionDetails,
                this.orderTotal,
            );
        }
        return new InventoryOrderPromotionCalculator(
            this.orderItems,
            this.promotionDetails,
            this.orderTotal,
        );
    }
}

module.exports = exports = OrderPromotionFactory;

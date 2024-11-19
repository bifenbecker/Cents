class OrderPromotion {
    // orderPromotionDetails table has orderId, promotionDetails (jsonB),
    // itemIds(ids of applicable items), orderable.

    constructor(orderItems, promotionDetails, orderType, orderTotal) {
        this.orderItems = orderItems;
        this.applicableItemIds = [];
        this.orderType = orderType;
        this.orderPromoDetails = {};
        this.promotionDetails = promotionDetails;
        this.promotionAmount = 0;
        this.orderTotal = orderTotal;
    }

    build() {
        this.addPromotionDetails();
        this.addApplicableItemIds();
        this.addOrderableType();
        this.addPromotionAmount();
        return this.orderPromoDetails;
    }

    addPromotionDetails() {
        this.orderPromoDetails.promoDetails = this.promotionDetails;
    }

    addApplicableItemIds() {
        if (this.promotionDetails.appliesToType === 'specific-items') {
            this.applicableServiceItems().forEach((i) => {
                this.addApplicableItemId(i);
                this.calculatePromotionsItemAmount(i);
            });

            this.applicableInventoryItems().forEach((i) => {
                this.addApplicableItemId(i);
                this.calculatePromotionsItemAmount(i);
            });
            if (this.isFixedPriceDiscount()) {
                this.promotionAmount =
                    this.orderTotal > this.discountValue ? this.discountValue : this.orderTotal;
            }
        } else {
            this.promotionAmount = this.isFixedPriceDiscount()
                ? this.discountValue
                : Number(((this.orderTotal * this.discountValue) / 100).toFixed(2));
        }
        this.orderPromoDetails.itemIds = this.applicableItemIds;
    }

    addApplicableItemId(item) {
        this.applicableItemIds.push(item.serviceReferenceItemDetailsId);
    }

    addOrderableType() {
        this.orderPromoDetails.orderableType = this.orderType;
    }

    applicableServiceItems() {
        return this.orderItems.filter(
            (i) => i.serviceMasterId && this.findItem(i.serviceMasterId, 'ServicesMaster'),
        );
    }

    applicableInventoryItems() {
        return this.orderItems.filter(
            (i) => i.inventoryMasterId && this.findItem(i.inventoryMasterId, 'Inventory'),
        );
    }

    findItem(itemId, type) {
        return this.promotionDetails.promotionItems.find(
            (i) => itemId === i.promotionItemId && i.promotionItemType === type,
        );
    }

    // check if discount is percentage or fixed.
    // check if discount is applicable to whole order or not.
    // if discount is item specific then calculate for
    // individual item and add that to this.promotionAmount.
    calculatePromotionsItemAmount(item) {
        // check for modifiers and also update the prices accordingly.
        if (this.isItemPerPound(item)) {
            this.addModifiersToTotal();
        }
        this.promotionAmount += this.isFixedPriceDiscount()
            ? 0
            : Number(this.calculatePercentageDiscount(item).toFixed(2));
    }

    isFixedPriceDiscount() {
        return this.promotionDetails.promotionType === 'fixed-price-discount';
    }

    get discountValue() {
        return this.promotionDetails.discountValue;
    }

    calculatePercentageDiscount(item) {
        const percentageAmount = (item.totalCost * this.discountValue) / 100;
        return Number(percentageAmount);
    }

    calculateFixedPriceDiscount(item) {
        if (this.discountValue >= item.totalCost) {
            return item.totalCost;
        }
        return item.totalCost - this.discountValue;
    }

    addPromotionAmount() {
        this.orderPromoDetails.promoDetails.orderPromotionAmount = Number(
            this.promotionAmount.toFixed(2),
        );
    }

    isItemPerPound(item) {
        return item.category === 'PER_POUND';
    }

    addModifiersToTotal() {
        this.orderItems.forEach((i) => {
            if (i.modifierId) {
                this.calculatePromotionsItemAmount(i);
            }
        });
    }
}

module.exports = exports = OrderPromotion;

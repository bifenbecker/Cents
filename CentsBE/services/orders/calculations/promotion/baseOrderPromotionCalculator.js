class BaseOrderPromotionCalculator {
    constructor(orderItems, promotionDetails, orderTotal) {
        this.orderItems = orderItems;
        this.promotionDetails = promotionDetails || {};
        this.applicableItemIds = [];
        this.orderPromoDetails = {};
        this.promoAmount = 0;
        this.orderTotal = orderTotal;
        this.applicableItems = [];
    }

    promotionAmount() {
        if (!this.promotionDetails.name) {
            return 0;
        }

        if (this.isAppliesToSpecificItems()) {
            this.applyPromoOnItems();
        } else {
            this.applyPromoOnOrder();
        }

        return this.promoAmount;
    }

    isValidOrder() {
        let availableValue = 0;
        let items = [];
        let total = 0;

        if (this.isAppliesToSpecificItems()) {
            items = this.applicableItems;
            this.applicableItems.forEach((item) => {
                total += item.price * item.count;
            });
            if (this.applicableItems.length === 0) {
                return false;
            }
        } else {
            total = this.orderTotal;
            items = this.orderItems;
        }

        if (this.promotionDetails.requirementType === 'min-quantity') {
            availableValue = items.reduce((pre, curr) => ({
                count: pre.count + curr.count,
            })).count;
        } else {
            availableValue = total;
        }

        if (availableValue < this.promotionDetails.requirementValue) {
            return false;
        }
        return true;
    }

    validateOrder() {
        if (!this.isValidOrder()) {
            this.orderPromoDetails = {
                isInvalidPromo: true,
                promoDetails: {
                    orderPromotionAmount: 0,
                },
            };
        }
    }

    calculate() {
        this.addPromotionDetails();
        this.addOrderableType();
        this.addPromotionAmount();
        this.validateOrder();
        return this.orderPromoDetails;
    }

    isAppliesToSpecificItems() {
        return this.promotionDetails.appliesToType === 'specific-items';
    }

    isMinAmountRequired() {
        return this.promotionDetails.requirementType === 'min-purchase-amount';
    }

    applyPromoOnOrder() {
        this.promoAmount = this.isFixedPriceDiscount()
            ? this.applyFixedPriceDiscountOnOrder()
            : Number(((this.orderTotal * this.discountValue) / 100).toFixed(2));
    }

    applyFixedPriceDiscountOnOrder() {
        if (this.isMinAmountRequired()) {
            if (this.orderTotal < this.promotionDetails.requirementValue) {
                this.orderPromoDetails.isInvalidPromo = true;
            }
        }
        return this.discountValue > this.orderTotal ? this.orderTotal : this.discountValue;
    }

    applyPromoOnItems() {
        this.applicableServiceItems().forEach((i) => {
            this.addApplicableItemId(i);
            this.addApplicableItem(i);
            this.applyPromotionOnItem(i);
        });

        this.applicableInventoryItems().forEach((i) => {
            this.addApplicableItemId(i);
            this.addApplicableItem(i);
            this.applyPromotionOnItem(i);
        });

        if (this.isFixedPriceDiscount() && this.applicableItemIds.length) {
            const itemsTotal = this.applicableItems.reduce(
                (previous, current) => previous + current.totalPrice,
                0,
            );
            this.promoAmount = itemsTotal > this.discountValue ? this.discountValue : itemsTotal;
        }
        this.orderPromoDetails.itemIds = this.applicableItemIds;
    }

    addPromotionDetails() {
        this.orderPromoDetails.promoDetails = this.promotionDetails;
    }

    // TODO override depending upon order type
    addApplicableItemId() {
        throw new Error('NOT IMPLEMENTED');
    }

    addApplicableItem(item) {
        this.applicableItems.push(item);
    }

    // check if discount is percentage or fixed.
    // check if discount is applicable to whole order or not.
    // if discount is item specific then calculate for
    // individual item and add that to this.promoAmount.
    applyPromotionOnItem(item) {
        // check for modifiers and also update the prices accordingly.
        if (this.isItemPerPound(item)) {
            this.addModifiersToTotal();
        }
        this.promoAmount += this.isFixedPriceDiscount()
            ? 0
            : Number(this.calculatePercentageDiscount(item).toFixed(2));
    }

    addModifiersToTotal() {
        this.orderItems.forEach((i) => {
            if (i.modifierId) {
                this.calculatePromotionsItemAmount(i);
            }
        });
    }

    calculateFixedPriceDiscount(item) {
        if (this.discountValue >= (item.totalCost || item.totalPrice)) {
            return item.totalCost || item.totalPrice;
        }
        return (item.totalCost || item.totalPrice) - this.discountValue;
    }

    calculatePercentageDiscount(item) {
        const percentageAmount = ((item.totalCost || item.totalPrice) * this.discountValue) / 100;
        return Number(percentageAmount);
    }

    isFixedPriceDiscount() {
        return this.promotionDetails.promotionType === 'fixed-price-discount';
    }

    // check if discount is percentage or fixed.
    // check if discount is applicable to whole order or not.
    // if discount is item specific then calculate for
    // individual item and add that to this.promoAmount.
    calculatePromotionsItemAmount(item) {
        // check for modifiers and also update the prices accordingly.
        if (this.isItemPerPound(item)) {
            this.addModifiersToTotal();
        }
        this.promoAmount += this.isFixedPriceDiscount()
            ? 0
            : Number(this.calculatePercentageDiscount(item).toFixed(2));
    }

    get discountValue() {
        return this.promotionDetails.discountValue;
    }

    isItemPerPound(item) {
        return item.category === 'PER_POUND';
    }

    findItem(itemId, type) {
        return this.promotionDetails.promotionItems.find(
            (i) => itemId === i.promotionItemId && i.promotionItemType === type,
        );
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

    addOrderableType() {
        throw new Error('NOT IMPLEMENTED');
    }

    addPromotionAmount() {
        this.orderPromoDetails.promoDetails.orderPromotionAmount = this.promotionAmount();
    }
}

module.exports = exports = BaseOrderPromotionCalculator;

class BaseCalculator {
    constructor(payload, promotionDetails, orderTotal) {
        this.payload = payload;
        this.promotionDetails = promotionDetails;
        this.orderTotal = orderTotal;
    }

    get creditAmount() {
        const { isCreditRemoved, newCreditApplied, previousCreditAmount, balanceDue, orderTotal } =
            this.payload;

        // --------Usecases-----
        // previous credit has been removed
        // No changes to credits
        // new credit has been added
        // remove and add new credit
        // new credit has been added on top of existing credits
        // ----------------------

        let newCreditAmount = previousCreditAmount || 0;
        if (isCreditRemoved) {
            newCreditAmount = 0;
        }
        if (newCreditApplied) {
            newCreditAmount += newCreditApplied;
        }
        // if new order total is less than applied credit amount
        // then we reduce the applied credits,
        // since we are crediting balance due amount back to the customer.
        const promotionAmount = this.newPromotionAmount() || 0;
        if (newCreditAmount > orderTotal && !promotionAmount) {
            // subtract difference between credits and order total from credits.
            newCreditAmount -= newCreditAmount - orderTotal;
        }
        if (newCreditAmount + promotionAmount > orderTotal && balanceDue < 0) {
            // abs of balance due is greater than newCreditAmount then.
            // we would be refunding the user back the whole amount.
            if (Math.abs(balanceDue) > newCreditAmount) {
                newCreditAmount = 0;
            } else {
                newCreditAmount += balanceDue;
            }
        }

        return newCreditAmount;
    }

    get netOrderTotal() {
        const {
            isCreditRemoved,
            previousTipAmount,
            newCreditApplied,
            previousCreditAmount,
            convenienceFee,
            pickupDeliveryFee,
            returnDeliveryFee,
            pickupDeliveryTip,
            returnDeliveryTip,
        } = this.payload;
        let newNetOrderTotal =
            this.orderTotal +
            previousTipAmount -
            previousCreditAmount +
            convenienceFee +
            pickupDeliveryFee +
            returnDeliveryFee +
            pickupDeliveryTip +
            returnDeliveryTip;
        if (isCreditRemoved) {
            newNetOrderTotal += previousCreditAmount;
        }
        if (newCreditApplied) {
            newNetOrderTotal -= newCreditApplied;
        }
        const promotionAmount = this.newPromotionAmount() || 0;
        newNetOrderTotal -= promotionAmount;
        // newNetOrderTotal cannot be less than 0,
        // if it is means balance due is negative and some amount is to be credited back to user.
        return newNetOrderTotal > 0 ? newNetOrderTotal : 0 + Number(previousTipAmount);
    }

    newPromotionAmount() {
        if (this.promotionDetails && this.promotionDetails.promoDetails) {
            return this.promotionDetails.promoDetails.orderPromotionAmount;
        }
        return 0;
    }

    get previousPromotionAmount() {
        const {
            previousOrderTotal,
            previousNetOrderTotal,
            previousTipAmount,
            previousCreditAmount,
        } = this.payload;
        return (
            previousTipAmount + previousOrderTotal - (previousCreditAmount + previousNetOrderTotal)
        );
    }

    get balanceDue() {
        const { balanceDue, orderType } = this.payload;
        if (orderType === 'ONLINE') {
            return 0;
        }
        if (balanceDue <= 0) {
            return 0; // set to 0 as amount will be credited back to customer
        }
        return balanceDue;
    }
}

module.exports = exports = BaseCalculator;

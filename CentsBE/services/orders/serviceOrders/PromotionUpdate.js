const { raw } = require('objection');
const ServiceOrder = require('../../../models/serviceOrders');
const CreditHistory = require('../../../models/creditHistory');

const Base = require('../../base');
const OrderPromotionFactory = require('../factories/orderPromotionCalculatorFactory');
const currentActiveServiceOrderItems = require('../queries/currentActiveServiceItems');

const applyToFixed = require('../../../utils/applyToFixed');

class PromotionUpdate extends Base {
    constructor(order, promotion) {
        super();
        this.order = order;
        this.promotion = promotion;
        this.upsertObject = {};
        this.orderPromotionDetails = {};
        this.lineItems = [];
        this.refundAmount = 0;
    }

    async buildLineItemDetails() {
        const { id } = this.order;
        this.lineItems = await currentActiveServiceOrderItems(id, true, this.transaction);
    }

    get creditsApplied() {
        const { creditAmount } = this.order;
        return creditAmount || 0;
    }

    get tipApplied() {
        const { tipAmount } = this.order;
        return tipAmount || 0;
    }

    get paymentStatus() {
        const { balanceDue } = this.upsertObject;
        return balanceDue === 0 ? 'PAID' : 'BALANCE_DUE';
    }

    get previousPromotionAmount() {
        const { promotionAmount } = this.order;
        return promotionAmount || 0;
    }

    get orderSubtotal() {
        const { orderTotal } = this.order;
        return orderTotal;
    }

    get previousBalance() {
        const { balanceDue } = this.order;
        return balanceDue;
    }

    get previousNetOrderTotal() {
        const { netOrderTotal } = this.order;
        return netOrderTotal;
    }

    get isPromoRemoved() {
        return !this.promotion.id;
    }

    handleAddPromotion() {
        const { id, masterOrderId } = this.order;
        this.upsertObject = {
            ...this.upsertObject,
            id,
            promotionId: this.promotion.id,
            paymentStatus: this.paymentStatus,
            order: {
                id: masterOrderId,
                promotionDetails: this.orderPromotionDetails,
            },
        };
    }

    buildOrderPromotionDetails() {
        const orderPromotionFactory = new OrderPromotionFactory(
            this.lineItems,
            this.promotion,
            this.orderSubtotal,
            { orderType: 'ServiceOrder' },
        ).calculator();
        this.orderPromotionDetails = orderPromotionFactory.calculate();
    }

    handleRemovePromotion() {
        const { id, masterOrderId } = this.order;
        this.upsertObject = {
            id,
            promotionAmount: 0,
            netOrderTotal: applyToFixed(this.previousNetOrderTotal + this.previousPromotionAmount),
            balanceDue: applyToFixed(this.previousBalance + this.previousPromotionAmount),
            paymentStatus: this.paymentStatus,
            order: {
                id: masterOrderId,
                promotionDetails: null,
            },
            promotionId: null,
        };
    }

    // Refund:
    // first refund credits.
    // if no credits were applied -> refund from net order total.
    // if credits were applied and after refunding them
    // if some balance is left refund it from order amount
    // as it would be covered from promotion.
    calculateTotals() {
        const promotionAmount = this.orderPromotionDetails.promoDetails.orderPromotionAmount;
        const newNetOrderTotal =
            this.orderSubtotal + this.tipApplied - (this.creditsApplied + promotionAmount);
        this.upsertObject.netOrderTotal =
            newNetOrderTotal > 0 ? applyToFixed(newNetOrderTotal) : this.tipApplied;
        const calculatedBalanceDue =
            this.previousBalance + (newNetOrderTotal - this.previousNetOrderTotal);
        if (newNetOrderTotal < 0) {
            // refund.
            if (this.creditsApplied) {
                // first reduce credits,
                if (Math.abs(newNetOrderTotal) > this.creditsApplied) {
                    this.upsertObject.creditAmount = 0;
                } else {
                    this.upsertObject.creditAmount = applyToFixed(
                        this.creditsApplied - Math.abs(newNetOrderTotal),
                        // newNetOrderTotal will be negative.
                    );
                }
            }
        }
        this.refundAmount =
            calculatedBalanceDue < 0 ? applyToFixed(Math.abs(calculatedBalanceDue)) : 0;

        this.upsertObject.balanceDue =
            calculatedBalanceDue < 0 ? 0 : applyToFixed(calculatedBalanceDue);
    }

    async createRefund() {
        const totalRefundAmount = applyToFixed(this.refundAmount);
        if (totalRefundAmount) {
            const { centsCustomerId, businessId } = this.order;
            await CreditHistory.query(this.transaction).insert({
                amount: totalRefundAmount,
                customerId: centsCustomerId,
                businessId,
                reasonId: raw(
                    '(select id from "creditReasons" where reason = \'Customer Service\')',
                ),
            });
        }
    }

    async perform() {
        if (this.isPromoRemoved) {
            this.handleRemovePromotion();
        } else {
            await this.buildLineItemDetails();
            this.buildOrderPromotionDetails();
            this.calculateTotals();
            this.handleAddPromotion();
        }
        await ServiceOrder.query(this.transaction).upsertGraph(this.upsertObject);
        await this.createRefund();
    }
}

module.exports = exports = PromotionUpdate;

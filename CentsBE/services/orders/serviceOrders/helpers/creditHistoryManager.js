const { raw } = require('objection');

const CreditHistory = require('../../../../models/creditHistory');

class CreditHistoryManager {
    constructor(payload, trx, calculator) {
        this.payload = payload;
        this.newCreditApplied = payload.newCreditApplied;
        this.isCreditRemoved = payload.isCreditRemoved;
        this.previousCreditAmount = payload.previousCreditAmount;
        this.trx = trx;
        this.calculator = calculator;
    }

    async manage() {
        if (this.payload.balanceDue < 0 && !this.isPostPay) {
            await this.creditBalanceDue();
        }

        if (this.payload.balanceDue < 0 && this.isPostPay) {
            await this.handlePostPayCredits();
        }

        if (this.newCreditApplied && this.isCreditRemoved) {
            await this.reimburseCredits();
            await this.recordNewCreditApplied();
        } else if (this.isCreditRemoved) {
            await this.reimburseCredits();
        } else if (this.newCreditApplied) {
            await this.recordNewCreditApplied();
        }
    }

    async handlePostPayCredits() {
        let { promotionAmount = 0 } = this.payload;
        if (this.calculator) {
            promotionAmount = this.calculator.newPromotionAmount() || 0;
        }
        const { orderTotal, previousPaymentStatus } = this.payload;
        // first case payment was made and balance due is negative.
        // second case credit was applied and it is more than the new order total.
        if (previousPaymentStatus === 'PAID') {
            await this.creditBalanceDue();
        } else if (
            this.previousCreditAmount &&
            this.previousCreditAmount + promotionAmount > orderTotal
        ) {
            await this.creditBalanceDue();
        }
    }

    async creditBalanceDue() {
        await this.createCreditHistory(Math.abs(this.payload.balanceDue));
    }

    async reimburseCredits() {
        await this.createCreditHistory(this.previousCreditAmount);
    }

    async recordNewCreditApplied() {
        await this.createCreditHistory(-this.newCreditApplied);
    }

    async createCreditHistory(amount) {
        const { centsCustomerId, businessId } = this.payload;
        await CreditHistory.query(this.trx).insert({
            reasonId: raw('(select id from "creditReasons" where reason = \'Order Adjustment\')'),
            customerId: centsCustomerId,
            amount,
            businessId,
        });
    }

    get isPostPay() {
        return this.payload.paymentTiming !== 'PRE-PAY';
    }
}

module.exports = exports = CreditHistoryManager;

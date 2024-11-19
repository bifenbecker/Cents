class OrderAdjustmentLogs {
    constructor(orderDetails, employee, calculator) {
        this.employee = employee || {};
        this.orderDetails = orderDetails;
        this.calculator = calculator;
        this.adjustmentLog = {};
    }

    build() {
        this.addOrderDetails();
        this.addEmployee();
        return this.adjustmentLog;
    }

    addEmployee() {
        if (this.employee.id) {
            this.adjustmentLog.teamMemberId = this.employee.id;
        }
    }

    addOrderDetails() {
        this.adjustmentLog = {
            serviceOrderId: this.orderDetails.id,
            notes: this.orderDetails.notes,
            previousNetOrderTotal: this.orderDetails.previousNetOrderTotal,
            newNetOrderTotal: this.calculator.netOrderTotal,
            consumedCredits: this.calculator.creditAmount,
            previousOrderTotal: this.orderDetails.previousOrderTotal,
            newOrderTotal: this.calculator.orderTotal,
        };
        if (this.isPromotionChanged()) {
            this.adjustmentLog.promotionId = this.orderDetails.promotionId;
        }
    }

    isPromotionChanged() {
        const { previousPromotionId, promotionId } = this.orderDetails;
        return previousPromotionId !== promotionId;
    }
}

module.exports = exports = OrderAdjustmentLogs;

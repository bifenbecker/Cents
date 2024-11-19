class ServiceOrderWeightBuilder {
    constructor(previousWeightLog, newWeightLog, employee) {
        this.previousWeightLog = previousWeightLog;
        this.newWeightLog = newWeightLog;
        this.employee = employee || {};
        this.weightLog = {};
    }

    build() {
        this.addDetails();
        this.compareWeightLogs();
        return this.weightLog;
    }

    addDetails() {
        if (this.previousWeightLog.id) {
            const { totalWeight, chargeableWeight, id, status, step } = this.previousWeightLog;
            this.weightLog = {
                totalWeight,
                chargeableWeight,
                id,
                status,
                step,
            };
        }
    }

    compareWeightLogs() {
        if (this.weightLog.id) {
            if (
                this.newWeightLog.chargeableWeight !== this.previousWeightLog.chargeableWeight ||
                this.newWeightLog.totalWeight !== this.previousWeightLog.totalWeight
            ) {
                this.weightLog.totalWeight = this.newWeightLog.totalWeight;
                this.weightLog.chargeableWeight = this.newWeightLog.chargeableWeight;
                this.weightLog.isAdjusted = true;
                this.weightLog.adjustedBy = this.employee ? this.employee.id : null;
                this.weightLog.status = this.weightLog.status
                    ? this.weightLog.status
                    : this.newWeightLog.status;
                this.weightLog.step = this.weightLog.step ? this.weightLog.step : 1;
            }
        } else {
            this.weightLog = {
                ...this.newWeightLog,
                teamMemberId: this.employee ? this.employee.id : null,
                step: 1,
            };
        }
    }
}

module.exports = exports = ServiceOrderWeightBuilder;

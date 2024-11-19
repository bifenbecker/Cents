const {
    turnStatuses,
    serviceTypes,
    DEVICE_PAYMENT_TYPES,
} = require('../../../../constants/constants');

class StatusTurnBuilder {
    constructor(payload) {
        this.payload = payload;
        this.turn = {};
    }

    addTurnDetails() {
        const {
            machine,
            device,
            lastTurn = {},
            cycleMode,
            cycleId,
            cyclePrice = 0,
            currentTimeStamp,
            deviceOrderId,
            storeCustomer: { id: storeCustomerId = null } = {},
            paymentTypeId,
        } = this.payload;
        this.turn.status = cycleMode === 'RUNNING' ? turnStatuses.STARTED : turnStatuses.COMPLETED;
        if (this.turn.status === turnStatuses.COMPLETED) {
            this.turn.completedAt = currentTimeStamp;
        }
        // Database default time should be fine
        // this.turn.createdAt = currentTimeStamp;
        this.turn.enabledAt = currentTimeStamp;
        this.turn.serviceType = serviceTypes.SELF_SERVICE;
        this.turn.deviceId = device.id;
        this.turn.machineId = machine.machineId;
        if (DEVICE_PAYMENT_TYPES[paymentTypeId] === 'EXTERNAL') {
            this.turn.netOrderTotalInCents = Math.floor(machine.price);
        } else {
            this.turn.netOrderTotalInCents = Math.floor(cyclePrice * 100);
        }
        // this.turn.netOrderTotalInCents = Math.floor(cyclePrice * 100);
        this.turn.storeCustomerId = storeCustomerId;
        this.turn.turnCode = 1000 + (lastTurn.id || 0) + 1;
        this.turn.storeId = machine.storeId;
        this.turn.lmCycleId = cycleId;
        this.turn.deviceOrderId = deviceOrderId;
        this.turn.paymentStatus =
            this.turn.netOrderTotalInCents >= machine.price ? 'PAID' : 'BALANCE_DUE';
    }

    addTurnLineItemDetails() {
        const {
            cyclePrice = 0,
            machine: { price: unitPriceInCents, machineType, turnTimeInMinutes },
        } = this.payload;
        const quantity = Math.floor((cyclePrice * 100) / unitPriceInCents);
        const turnTime = machineType === 'DRYER' ? quantity * turnTimeInMinutes : null;
        const lineItem = {
            unitPriceInCents,
            quantity,
            turnTime,
        };
        this.turn.turnLineItems = [lineItem];
    }

    addOrderDetails() {
        const {
            machine: { storeId },
        } = this.payload;
        this.turn.order = {
            storeId,
        };
        return this.turn;
    }

    build() {
        this.addTurnDetails();
        this.addTurnLineItemDetails();
        this.addOrderDetails();
        return this.turn;
    }
}

module.exports = StatusTurnBuilder;

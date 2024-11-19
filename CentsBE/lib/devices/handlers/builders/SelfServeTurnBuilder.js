const {
    turnStatuses,
    serviceTypes,
    DEVICE_PAYMENT_MAPPING,
} = require('../../../../constants/constants');

class SelfServeTurnBuilder {
    constructor(payload) {
        this.payload = payload;
        this.turn = {};
    }

    addTurnDetails() {
        const {
            currentTimeStamp,
            device,
            paymentEnumeration: { amount = 0 } = {},
            machine,
            currentTurn,
            storeCustomer: { id: storeCustomerId = null } = {},
        } = this.payload;
        this.turn.deviceOrderId = this.getDeviceOrderId();
        if (currentTurn && currentTurn.id) {
            const { id, netOrderTotalInCents } = currentTurn;
            this.turn.id = id;
            this.turn.netOrderTotalInCents = netOrderTotalInCents + Math.floor(amount * 100);
            this.turn.paymentStatus = this.paymentStatus();
            return this.turn;
        }
        this.turn.status = turnStatuses.ENABLED;
        // Database default value will be assigned
        // this.turn.createdAt = currentTimeStamp;
        this.turn.enabledAt = currentTimeStamp;
        this.turn.serviceType = serviceTypes.SELF_SERVICE;
        this.turn.deviceId = device.id;
        this.turn.machineId = machine.machineId;
        this.turn.netOrderTotalInCents = Math.floor(amount * 100);
        this.turn.storeCustomerId = storeCustomerId;
        this.turn.turnCode = this.getTurnCode();
        this.turn.storeId = machine.storeId;
        this.turn.paymentStatus = this.paymentStatus();
        return this.turn;
    }

    paymentStatus() {
        const { machine } = this.payload;
        return this.turn.netOrderTotalInCents >= machine.price ? 'PAID' : 'BALANCE_DUE';
    }

    addTurnLineItemDetails() {
        const {
            paymentEnumeration: { amount = 0 } = {},
            machine: { price: unitPriceInCents, machineType, turnTimeInMinutes },
            currentTurn,
        } = this.payload;
        const quantity = Math.floor((amount * 100) / unitPriceInCents);
        const turnTime = machineType === 'DRYER' ? quantity * turnTimeInMinutes : null;
        const lineItem = {
            unitPriceInCents,
            quantity,
            turnTime,
        };
        if (currentTurn && currentTurn.id) {
            lineItem.turnId = currentTurn.id;
        }
        this.turn.turnLineItems = [lineItem];
    }

    addOrderDetails() {
        const {
            machine: { storeId },
        } = this.payload;
        if (this.turn.id) {
            return null;
        }
        this.turn.order = {
            storeId,
        };
        return this.turn;
    }

    getDeviceOrderId() {
        const { paymentType, orderId } = this.payload;
        return `${DEVICE_PAYMENT_MAPPING[paymentType]}_${orderId}`;
    }

    getTurnCode() {
        // const { machineId, type } = this.machine;
        const { lastTurn = {} } = this.payload;
        return 1000 + (lastTurn.id || 0) + 1;
    }

    addPaymentDetails() {
        const {
            paymentEnumeration,
            machinePaymentType,
            currentTurn,
            currentTimeStamp,
            needsPaymentRecord = true,
        } = this.payload;
        if (needsPaymentRecord) {
            const payment = {
                details: paymentEnumeration,
                paymentTypeId: machinePaymentType.id,
                createdAt: currentTimeStamp,
            };
            if (currentTurn && currentTurn.id) {
                payment.turnId = currentTurn.id;
            }
            this.turn.machinePayments = [payment];
        }
    }

    build() {
        this.addTurnDetails();
        this.addTurnLineItemDetails();
        this.addOrderDetails();
        this.addPaymentDetails();
        return this.turn;
    }
}

module.exports = SelfServeTurnBuilder;

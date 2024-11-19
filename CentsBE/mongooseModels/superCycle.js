const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const MACHINE_STATES = {
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
    STARTED: 'STARTED',
    FINISHED: 'FINISHED',
};

const CYCLE_TYPES = {
    CUSTOMER_SERVICE: 'Customer Service',
    SELF_SERVICE: 'Self Service',
    TECHNICAL_WASH: 'Technical Wash',
    WASH_FOLD: 'Wash and Fold Order',
};

const superCycleSchema = new Schema({
    machineId: Number,
    deviceId: Number,
    orderId: Number,
    startTime: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: Object.values(MACHINE_STATES),
    },
    cycleType: {
        type: String,
        enum: Object.values(CYCLE_TYPES),
    },
    cycleSettings: Schema.Types.Mixed,
    cyclePrice: Schema.Types.Decimal128,
    customerId: Number,
    employeeId: Number,
    notes: Schema.Types.Mixed,
    washReason: Schema.Types.Mixed,
});

const SuperCycle = mongoose.model('superCycle', superCycleSchema);

module.exports = SuperCycle;

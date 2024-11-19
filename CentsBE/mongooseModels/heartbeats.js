const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const MACHINE_STATES = {
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
    STARTED: 'STARTED',
    FINISHED: 'FINISHED',
};

// const JOB_STATES = {
//     STARTED: 'STARTED',
//     FINISHED: 'FINISHED',
// } -> Might be used in future.

const hearBeatSchema = new Schema({
    machineId: Number,
    heartBeat: [
        new Schema({
            time: Date,
            status: {
                type: String,
                enum: Object.values(MACHINE_STATES),
            },
            // job: Number, // id of machinePricing table.
            idempotencyKey: String,
            cycle: Schema.Types.Mixed,
        }),
    ],
});

const HeartBeat = mongoose.model('HeartBeat', hearBeatSchema);

module.exports = HeartBeat;

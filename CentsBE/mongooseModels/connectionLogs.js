const mongoose = require('mongoose');
const { Schema } = require('mongoose');

// const logSchema = new Schema({
//     status: String,
//     time: { type: Date, default: Date.now },
//     reason: String,

// });
const ConnectionLogsSchema = new Schema(
    {
        PennyID: String,
        deviceId: Number,
        status: String,
        time: { type: Date, default: Date.now },
        disconnectReason: String,
    },
    { timestamps: true },
);

const ConnectionLogs = mongoose.model('ConnectionLog', ConnectionLogsSchema);

module.exports = ConnectionLogs;

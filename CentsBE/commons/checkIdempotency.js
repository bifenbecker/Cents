const HeartBeat = require('../mongooseModels/heartbeats');

const checkIdempotency = async (machineId, idempotencyKey) => {
    const keyUsed = await HeartBeat.find({
        machineId,
        'heartBeat.idempotencyKey': idempotencyKey,
    });
    if (keyUsed.length) {
        return true;
    }
    return false;
};

module.exports = checkIdempotency;

/**
 * !! Caution, changing anything in this file
 * might lead to failure in pusher and message passing.
 * After adding any change please thoroughly
 * test it with both pusher and message passing.
 */
function createTurnMessageBuilder(payload) {
    const newPayload = payload;
    const { device, stats, machineId, turn } = newPayload;
    if (device && device.id) {
        const message = {
            ...stats,
            deviceId: device.id,
            machineId: Number(machineId),
            status: device.status,
            deviceName: device.name,
            activeTurn: {
                id: turn.id,
                serviceType: turn.serviceType,
            },
        };
        const { storeId } = turn;
        newPayload.pusherMessage = { message, storeId };
    }
    return newPayload;
}

module.exports = exports = { createTurnMessageBuilder };

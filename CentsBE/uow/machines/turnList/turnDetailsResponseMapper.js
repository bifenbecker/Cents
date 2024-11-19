const { formattedTime } = require('../../../utils/formattedTime');

function turnResponseMapper(turn) {
    const timeZone = turn.store.settings.timeZone || 'UTC';

    const turnDetails = {
        id: turn.id,
        createdAt: formattedTime(turn.createdAt, timeZone),
        startedAt: formattedTime(turn.startedAt, timeZone),
        completedAt: formattedTime(turn.completedAt, timeZone),
        enabledAt: formattedTime(turn.enabledAt, timeZone),
        status: turn.status,
        machine: {
            id: turn.machine.id,
            name: turn.machine.name,
            type: turn.machine.model.machineType.name === 'WASHER' ? 'W' : 'D',
        },
    };
    if (turn.createdBy) {
        turnDetails.employee = {
            id: turn.createdBy.id,
            firstName: turn.createdBy.firstname,
            lastName: turn.createdBy.lastname,
        };
    }
    if (turn.device && turn.device.isPaired) {
        turnDetails.deviceId = turn.device.id;
    }

    if (turnDetails.machine.type === 'D') {
        let totalTurnTime = 0;
        for (const item of turn.turnLineItems) {
            totalTurnTime += +item.turnTime;
        }
        turnDetails.totalTurnTime = totalTurnTime;
    }
    let totalQuantity = 0;
    for (const item of turn.turnLineItems) {
        totalQuantity += +item.quantity;
    }
    turnDetails.quantity = totalQuantity;
    return turnDetails;
}

module.exports = {
    turnResponseMapper,
};

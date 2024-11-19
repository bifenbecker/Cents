const { MACHINE_TYPES } = require('../../../constants/constants');
const TurnLineItem = require('../../../models/turnLineItems');
const { getMachineType } = require('../../../utils/machines/machineUtil');

async function createTurnLineItemUow(payload) {
    const newPayload = payload;
    const { turnId, machineDetails, transaction, quantity } = payload;
    const { model, machinePricings, turnTimeInMinutes } = machineDetails;
    const machineType = getMachineType(model);
    const turnLineItemPayload = {
        turnId,
        quantity: 1,
        unitPriceInCents: machinePricings[0].price,
    };
    if (machineType === MACHINE_TYPES.DRYER) {
        turnLineItemPayload.turnTime = quantity * turnTimeInMinutes;
        turnLineItemPayload.quantity = quantity;
    }
    await TurnLineItem.query(transaction).insert(turnLineItemPayload);

    return newPayload;
}
module.exports = {
    createTurnLineItemUow,
};

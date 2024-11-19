// models
const ServiceOrderTurn = require('../../../models/serviceOrderTurn');
const { turnResponseMapper } = require('./turnDetailsResponseMapper');

function responseMapper(serviceOrderTurns) {
    return serviceOrderTurns.map((serviceOrderTurn) => turnResponseMapper(serviceOrderTurn.turn));
}
/**
 *
 * fetches list of turns
 * @param {object} payload
 * @returns array of turns
 */
async function serviceOrderTurnList(payload) {
    try {
        const { transaction, serviceOrderId, type } = payload;
        let serviceOrderTurnsQuery = ServiceOrderTurn.query(transaction)
            .withGraphJoined(
                '[turn.[createdBy,device,machine.model.machineType,turnLineItems,store.settings]]',
            )
            .where('serviceOrderTurns.serviceOrderId', serviceOrderId);
        if (type) {
            serviceOrderTurnsQuery = serviceOrderTurnsQuery.where(
                'turn:machine:model:machineType.name',
                type,
            );
        }
        const serviceOrderTurns = await serviceOrderTurnsQuery.orderBy('turn:id');

        const result = responseMapper(serviceOrderTurns);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}
module.exports = exports = serviceOrderTurnList;

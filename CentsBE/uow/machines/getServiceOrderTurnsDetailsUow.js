const Turn = require('../../models/turns');
const { turnResponseMapper } = require('./turnList/turnDetailsResponseMapper');

async function getServiceOrderTurnDetails(payload) {
    const { turnId } = payload;
    const turn = await Turn.query()
        .findById(turnId)
        .withGraphJoined(
            '[createdBy,device,machine.model.machineType,turnLineItems,store(storeFilter).[settings(storeSettings)]]',
        )
        .modifiers({
            storeFilter: (query) => {
                query.select('id');
            },
            storeSettings: (query) => {
                query.select('timeZone', 'storeId');
            },
        });
    return turnResponseMapper(turn);
}

module.exports = {
    getServiceOrderTurnDetails,
};

const { turnStatuses } = require('../../constants/constants');
const Turn = require('../../models/turns');

async function getActiveTurnUow(machineId, transaction) {
    const query = `SELECT * FROM "turns" WHERE "machineId"=${machineId} 
        AND "status" in ('${turnStatuses.CREATED}', '${turnStatuses.STARTED}', '${turnStatuses.ENABLED}')
        order by "id" DESC LIMIT 1
    `;
    const { rows: activeTurn } = await Turn.query(transaction).knex().raw(query);
    if (activeTurn.length) {
        return {
            id: activeTurn[0].id,
            serviceType: activeTurn[0].serviceType,
            storeCustomerId: activeTurn[0].storeCustomerId,
        };
    }
    return {};
}

module.exports = {
    getActiveTurnUow,
};

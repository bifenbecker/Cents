const ServiceOrder = require('../../../models/serviceOrders');

/**
 *
 * @param {*} serviceOrderId
 * @returns responseList
 */

async function getServiceOrderTurnsCount(payload) {
    try {
        const { transaction, serviceOrderId } = payload;
        const serviceOrderDetails = await ServiceOrder.query(transaction).knex().raw(`
        SELECT
                COUNT(case when "machineTypes"."name" = 'DRYER' then 1 else null end)::INTEGER as "dryerTurnsCount",
                COUNT(case when "machineTypes"."name" = 'WASHER' then 1 else null end)::INTEGER as "washerTurnsCount"
        FROM "serviceOrders"
        INNER JOIN "serviceOrderTurns" ON "serviceOrders".id = "serviceOrderTurns"."serviceOrderId"
        INNER JOIN "turns" ON "serviceOrderTurns"."turnId" = turns.id
        INNER JOIN "machines" ON turns."machineId" = machines.id
        INNER JOIN "machineModels" ON machines."modelId" = "machineModels".id
        INNER JOIN "machineTypes" ON "machineModels"."typeId" = "machineTypes".id
        WHERE "serviceOrders".id = ${serviceOrderId}
        `);
        return serviceOrderDetails.rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = exports = getServiceOrderTurnsCount;

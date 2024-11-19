// models
const { raw } = require('objection');
const { dateFormat } = require('../../helpers/dateFormatHelper');
const Turns = require('../../models/turns');

/**
 * fetches list of turns based on the query parameters
 * @param {object} payload
 * @returns array of turns
 */

function responseMapper(turnLists, hasMore) {
    const response = {};
    const turnsList = [];
    for (const turn of turnLists) {
        const temp = {};
        const timezone = turn.store.settings.timeZone || 'UTC';
        temp.id = turn.id;
        temp.prefix = turn.machine.model.machineType.name === 'WASHER' ? 'WT' : 'DT';
        temp.code = turn.turnCode;
        temp.createdAt = dateFormat(turn.createdAt, timezone);
        temp.updatedAt = dateFormat(turn.updatedAt, timezone);
        temp.completedAt = dateFormat(turn.completedAt, timezone);
        temp.serviceType = turn.serviceType;
        turnsList.push(temp);
    }
    response.turns = turnsList;
    response.hasMore = hasMore;
    return response;
}
async function turnDetails(payload) {
    try {
        const { transaction, machineId, page, limit = 20 } = payload;

        const turnList = await Turns.query(transaction)
            .select(
                'id',
                raw('count(turns.id) over() as "totalCount"'),
                'turnCode',
                'completedAt',
                'updatedAt',
                'createdAt',
                'serviceType',
            )
            .withGraphFetched('[store.settings,machine.model.machineType]')
            .where('machineId', machineId)
            .where('deletedAt', null)
            .limit(limit)
            .offset((Number(page) - 1) * limit)
            .orderBy('turns.id', 'desc');
        const hasMore = turnList.length ? Number(turnList[0].totalCount) > limit * page : false;
        const result = responseMapper(turnList, hasMore);

        return result;
    } catch (error) {
        throw new Error(error);
    }
}
module.exports = exports = turnDetails;

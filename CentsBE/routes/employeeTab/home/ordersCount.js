const { raw } = require('objection');
const ServiceOrder = require('../../../models/serviceOrders');
const Store = require('../../../models/store');
const InventoryOrder = require('../../../models/inventoryOrders');

async function getOrdersCount(req, res, next) {
    try {
        const { isHub, id } = req.currentStore;
        const otherStatusesCount = await ServiceOrder.query()
            .knex()
            .raw(
                `SELECT 
            sum(case when status in ('IN_TRANSIT_TO_HUB', 'DROPPED_OFF_AT_HUB') then 1 end) as "receiveForHub",
            sum(case when status in ('IN_TRANSIT_TO_STORE', 'DROPPED_OFF_AT_STORE') then 1 end) as "receiveForStore",
            sum(case when status = 'HUB_PROCESSING_COMPLETE' then 1 end) as "releaseForHub",
            sum(case when status = 'DESIGNATED_FOR_PROCESSING_AT_HUB' then 1 end) as "releaseForStore"
            from "${ServiceOrder.tableName}" where ${
                    isHub
                        ? `("${ServiceOrder.tableName}"."storeId" = ${id} or "${ServiceOrder.tableName}"."hubId" = ${id})`
                        : `("${ServiceOrder.tableName}"."storeId" = ${id})`
                }`,
            );
        const { rows } = otherStatusesCount;
        let count = {};
        if (rows.length) {
            count = { ...rows[0] };
        }
        res.status(200).json({
            success: true,
            receiveForHub: count.receiveForHub || 0,
            receiveForStore: count.receiveForStore || 0,
            releaseForHub: count.releaseForHub || 0,
            releaseForStore: count.releaseForStore || 0,
        });
    } catch (error) {
        next(error);
    }
}
const getStatusQueryString = (status, column, isHub) => {
    let query = `SELECT "${ServiceOrder.tableName}"."${column}", "${Store.tableName}"."name", `;
    let appendComma = '';
    status.forEach((a) => {
        query += `${appendComma} sum(case when status = '${a}' then 1 end) as ${a}`;
        appendComma = ',';
    });
    if (isHub) {
        query += ` from "${ServiceOrder.tableName}" INNER JOIN ${Store.tableName} ON "${Store.tableName}"."id" = "${ServiceOrder.tableName}"."storeId" `;
    } else {
        query += ` from "${ServiceOrder.tableName}" INNER JOIN ${Store.tableName} ON "${Store.tableName}"."id" = "${ServiceOrder.tableName}"."hubId" `;
    }
    return query;
};

async function getInventoryOrdersCount(storeId) {
    const orderCount = await InventoryOrder.query()
        .select(
            raw(`
    sum(case when status = 'CANCELLED' then 1 else 0 end) as "cancelled",
    sum(case when status <> 'CANCELLED' then 1 else 0 end) as "completed"
    `),
        )
        .where('storeId', storeId)
        .first();
    return orderCount;
}
async function getOrdersCountByStatus(req, res, next) {
    try {
        const { isHub, id } = req.currentStore;
        const { status, bussinessId } = req.query;
        let query = getStatusQueryString(status, 'storeId', isHub);
        let query2;
        if (bussinessId) {
            query += ` where ("storeId" in (select id from stores s2 where s2."businessId" =${bussinessId} and s2."isHub" = false))`;
            query2 = getStatusQueryString(status, 'hubId');
            query2 += ` where ("${ServiceOrder.tableName}"."hubId" in (select id from stores s2 where s2."businessId" =${bussinessId} and s2."isHub" = true))`;
            query2 += ` group by "${ServiceOrder.tableName}"."hubId", "${Store.tableName}"."name" `;
        } else {
            query += `where ${
                isHub
                    ? `("${ServiceOrder.tableName}"."hubId" = ${id}) or ("${ServiceOrder.tableName}"."storeId" = ${id})`
                    : `("${ServiceOrder.tableName}"."storeId" = ${id})`
            }`;
        }
        query += ` group by "storeId", "${Store.tableName}"."name" `;

        let otherStatusesCount = await ServiceOrder.query().knex().raw(query);
        otherStatusesCount = otherStatusesCount.rows;
        otherStatusesCount.map((_orderCount) => {
            const orderCount = _orderCount;
            for (const key in orderCount) {
                if (orderCount[key] === null) orderCount[key] = '0';
            }
            return orderCount;
        });

        if (bussinessId) {
            const hubCounts = await ServiceOrder.query().knex().raw(query2);
            otherStatusesCount = [...otherStatusesCount, ...hubCounts.rows];
        }
        if (status.includes('COMPLETED') && status.includes('CANCELLED')) {
            const invetoryOrderCount = await getInventoryOrdersCount(req.currentStore.id);
            for (const i of otherStatusesCount) {
                if (i.storeId === req.currentStore.id) {
                    i.cancelled = `${Number(i.cancelled) + Number(invetoryOrderCount.cancelled)}`;
                    i.completed = `${Number(i.completed) + Number(invetoryOrderCount.completed)}`;
                    break;
                }
            }
        }
        res.status(200).json({
            success: true,
            rows: otherStatusesCount,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = { getOrdersCount, getOrdersCountByStatus };

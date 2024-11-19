const { raw } = require('objection');
const ServiceOrder = require('../../../models/serviceOrders');
const InventoryOrder = require('../../../models/inventoryOrders');

async function getCustomerOrders(req, res, next) {
    try {
        const { id } = req.params;
        const page = req.query.page || 1;
        const { businessId } = req.currentStore;

        const query = `(select "storeCustomers".id from "storeCustomers" where "storeCustomers"."centsCustomerId" = ${id} 
        and "storeCustomers"."businessId" = ${businessId})`;

        const totalCount = await ServiceOrder.knex().raw(`
            SELECT COUNT(*) AS "totalCount"
            FROM (
                SELECT "serviceOrders"."id" AS id from "serviceOrders" WHERE "serviceOrders"."storeCustomerId" in ${query}
                AND ("serviceOrders"."storeId" = ${req.currentStore.id} or "serviceOrders"."hubId" = ${req.currentStore.id})
                UNION
                SELECT "inventoryOrders"."id" AS id from "inventoryOrders" WHERE "inventoryOrders"."storeCustomerId" in ${query}
                AND "inventoryOrders"."storeId" = ${req.currentStore.id}
            ) x
        `);

        const orders = await ServiceOrder.query()
            .select(
                'createdAt',
                'orderCode',
                'id',
                'netOrderTotal',
                'status',
                raw('\'ServiceOrder\' AS "orderableType"'),
            )
            .whereRaw(`"serviceOrders"."storeCustomerId" IN ${query}`)
            .andWhereRaw(
                `("serviceOrders"."storeId" = ${req.currentStore.id} or "serviceOrders"."hubId" = ${req.currentStore.id})`,
            )
            .union(
                InventoryOrder.query()
                    .select(
                        'createdAt',
                        'orderCode',
                        'id',
                        'netOrderTotal',
                        'status',
                        raw('\'InventoryOrder\' AS "orderableType"'),
                    )
                    .whereRaw(`"inventoryOrders"."storeCustomerId" IN ${query}`)
                    .andWhereRaw(`("inventoryOrders"."storeId" = ${req.currentStore.id})`),
            )
            .offset(10 * (page - 1))
            .orderBy('orderCode', 'desc')
            .limit(10);

        res.json({
            success: true,
            totalCount: totalCount.rows[0].totalCount || 0,
            orders,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getCustomerOrders;

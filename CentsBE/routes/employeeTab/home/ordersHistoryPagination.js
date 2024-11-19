const Order = require('../../../models/orders');
const { mapResponse } = require('./getOrdersPagination');
const CustomQuery = require('../../../services/customQuery');
const { buildStatusesMap } = require('../../../utils/reports/reportsUtils');

const sortObject = {
    up: 'asc',
    down: 'desc',
};

const sortFields = {
    placedAt: 'placedAt',
    bagCount: 'bagCount',
    id: 'orderCode',
    name: 'fullName',
    storeName: 'storeName',
    paymentStatus: 'paymentStatus',
    status: 'status',
};

function searchQuery(keyword) {
    if (keyword) {
        const fullName = `(
            concat("storeCustomers"."firstName", ' ', "storeCustomers"."lastName") ilike '%${keyword}%')`;
        const email = `("storeCustomers"."email" ilike '%${keyword}%')`;
        const phoneNumber = `(
            "storeCustomers"."phoneNumber" ilike '%${keyword}%'
        )`;
        const orderCode = `("orderCode" ilike '%${keyword}%')`;

        return `and (${fullName} or ${email} or ${phoneNumber} or ${orderCode})`;
    }
    return '';
}

function storeFilter(currentStore, otherStores) {
    let whereQuery = '';
    if (otherStores && otherStores.length) {
        if (otherStores.includes(currentStore.id.toString())) {
            whereQuery = `"serviceOrders"."storeId" = ${currentStore.id} or ("serviceOrders"."storeId" in (${otherStores}))`;
        } else {
            whereQuery = `"serviceOrders"."storeId" in (${otherStores})`;
        }
    } else {
        whereQuery = `"serviceOrders"."storeId" = ${currentStore.id}`;
    }
    return whereQuery;
}

function inventoryOrdersStoreCheck(currentStore, otherStores) {
    if (otherStores && otherStores.length) {
        if (otherStores.includes(currentStore.id.toString())) {
            return true;
        }
        return false;
    }
    return true;
}

function serviceOrdersQuery(currentStore, otherStores, keyword) {
    const baseQuery = `select
    "serviceOrders".id as "id",
    "serviceOrders"."placedAt" as "placedAt",
    "serviceOrders".rack,
    ("storeCustomers"."firstName" || ' '|| "storeCustomers"."lastName") as "fullName",
    "serviceOrders"."storeId", "serviceOrders".status,
    LOWER ( "stores"."name" ) as "storeName",
    "serviceOrders"."paymentStatus",
    "serviceOrders"."orderCode", "serviceOrders"."orderType",
    json_agg ( distinct jsonb_build_object
        (
            'id', "serviceOrderBags".id
        )) as "serviceOrderBags", count(distinct "serviceOrderBags"."id") as "bagCount"
    from "serviceOrders"
    left join "storeCustomers" on "storeCustomers"."id" = "serviceOrders"."storeCustomerId"
    left join stores on  "serviceOrders"."storeId" = stores.id
    left join "serviceOrderBags" on "serviceOrderBags"."serviceOrderId" = "serviceOrders".id`;
    const where = `
    where "serviceOrders".status in ('CANCELLED', 'COMPLETED')
    and (${storeFilter(currentStore, otherStores)}) ${searchQuery(keyword)}`;
    const groupBy = 'group by "serviceOrders".id, "storeCustomers".id, stores.id';
    return `${baseQuery} ${where} ${groupBy}`;
}

function inventoryOrdersQuery(currentStore, keyword) {
    const query = `
    select
    "inventoryOrders".id as "ioId", "inventoryOrders"."orderCode" as "orderCode",'INVENTORY' as "orderType",
    "inventoryOrders".status as "ioStatus", "inventoryOrders"."paymentStatus" as "ioPaymentStatus",
    "inventoryOrders"."createdAt" as "ioPlacedAt",
    ("storeCustomers"."firstName" || ' '|| "storeCustomers"."lastName") as "fullName",
    stores.id as "ioStoreId",
    LOWER ( "stores"."name" ) as "ioStoreName"
    from "inventoryOrders"
    left join "storeCustomers" on "storeCustomers".id = "inventoryOrders"."storeCustomerId"
    left join stores on stores.id = "inventoryOrders"."storeId"
    where stores.id = ${currentStore.id} ${searchQuery(keyword)} 
    group by "inventoryOrders".id, "storeCustomers".id, stores.id`;
    return query;
}

function deliverySubQuery() {
    return `
    select "orderId", jsonb_build_object(
        'id', "orderDeliveries".id
    ) as "deliveryDetails" from "orderDeliveries" where type = 'RETURN' and status not in ('FAILED','CANCELED')
    `;
}

function orderByQuery(sortBy, sortOrder, orderBy) {
    let orderByQuery = '';
    if (sortOrder) {
        if (sortBy === 'placedAt') {
            // if sortBy is placedAt at then up refers to ascending order
            // and down refers to descending order.
            // orderBy === 'location' then first priority is given to location name, then placedAt
            orderByQuery = ` order by ${
                orderBy === 'location' ? '"storeName" asc ,' : ''
            } "${sortBy}" ${sortOrder === 'up' ? sortObject.up : sortObject.down}`;
        } else {
            // orderBy === 'location' then first priority is given to location name, then bagCount
            orderByQuery = `order by ${orderBy === 'location' ? '"storeName" asc ,' : ''} "${
                sortFields[sortBy]
            }" ${sortOrder === 'down' ? sortObject.down : sortObject.up}`;
        }
    } else {
        // by default orders should be descending.
        orderByQuery = 'order by "orderCode" desc';
    }
    return orderByQuery;
}

function combinedBaseQuery(req, stores, keyword) {
    const baseQuery = `
            select count(orders.id) over() as total_count,
            coalesce("serviceOrders"."fullName", "inventoryOrders"."fullName") as "fullName",
            "serviceOrders".rack,
            coalesce("serviceOrders"."orderType", "inventoryOrders"."orderType") as "orderType",
            coalesce("serviceOrders"."storeId", "inventoryOrders"."ioStoreId") as "storeId",
            coalesce("serviceOrders"."storeName", "inventoryOrders"."ioStoreName") as "storeName",
            coalesce("serviceOrders".status, "inventoryOrders"."ioStatus") as status,
            coalesce("serviceOrders"."paymentStatus", "inventoryOrders"."ioPaymentStatus") as "paymentStatus",
            coalesce("serviceOrders"."orderCode", "inventoryOrders"."orderCode") as "orderCode",
            coalesce("serviceOrders"."id", "inventoryOrders"."ioId") as id,
            coalesce("serviceOrders"."bagCount", 0) as "bagCount",
            coalesce("serviceOrders"."serviceOrderBags", '[]') as "serviceOrderBags",
            orders.id as "orderId", orders."orderableType" as "orderableType", orders."orderableId" as "orderableId",
            case when "serviceOrders"."placedAt" is null then  "inventoryOrders"."ioPlacedAt" else "serviceOrders"."placedAt" end as "placedAt",
            "orderDeliveries"."deliveryDetails" as delivery
            from "orders"
            left join (${serviceOrdersQuery(req.currentStore, stores, keyword)}) as
            "serviceOrders" on "serviceOrders"."id" = "orders"."orderableId"
            and "orders"."orderableType" in ('serviceOrder', 'ServiceOrder')
            left join (
                ${inventoryOrdersQuery(req.currentStore, keyword)}
            ) as "inventoryOrders" on "inventoryOrders"."ioId" = "orders"."orderableId" 
            and "orders"."orderableType" in ( 'InventoryOrder')
            left join (${deliverySubQuery()}) as "orderDeliveries" on "orderDeliveries"."orderId" = orders.id
            where ("serviceOrders"."storeId" is not null or "inventoryOrders"."ioStoreId" is not null)
            `;
    return baseQuery;
}

function serviceOnlyBaseQuery(req, stores, keyword) {
    const baseQuery = `
        select count(orders.id) over() as total_count,
        orders.id as "orderId", orders."orderableType" as "orderableType", orders."orderableId" as "orderableId",
        "serviceOrders".*, "orderDeliveries"."deliveryDetails" as delivery
        from "orders"
        join (${serviceOrdersQuery(req.currentStore, stores, keyword)}) as
            "serviceOrders" on "serviceOrders"."id" = "orders"."orderableId"
            and "orders"."orderableType" in ('serviceOrder', 'ServiceOrder')
        left join (${deliverySubQuery()}) as "orderDeliveries" on "orderDeliveries"."orderId" = orders.id
    `;
    return baseQuery;
}

/**
 * Fetch a paginated list of all completed orders for a given store,
 * including any sort or filter parameters
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function ordersList(req, res, next) {
    try {
        const {
            keyword,
            stores,
            page,
            sortBy,
            sortOrder,
            orderBy,
            statuses = ['COMPLETED', 'CANCELLED'],
        } = req.query;
        const storeList = [req.currentStore.id];
        let response = [];
        let totalOrderCount = 0;

        if (stores) {
            storeList.push(stores);
        }

        if (req.apiVersion >= '1.4.63' && req.incomingRequestHasVersion) {
            const completedOrders = statuses.includes('COMPLETED');
            const statusesMap = buildStatusesMap(statuses);
            const options = {
                ordersOffset: (page - 1) * 10,
                ordersLimit: 10,
                stores: storeList,
                statusesMap,
                sortBy: sortFields[sortBy],
                sortOrder: sortOrder === 'up' ? 'asc' : 'desc',
                orderBy,
                sortRelation: sortBy !== 'name',
            };
            if (completedOrders) {
                options.completedOrders = true;
            }
            if (keyword && keyword.length) {
                options.keyword = keyword;
            }
            const query = new CustomQuery('employee-tab/order-history.sql', options);
            const orders = await query.execute();
            const { resp, totalOrders } = mapResponse(orders);
            response = resp;
            totalOrderCount = totalOrders;
        } else {
            const baseQuery = inventoryOrdersStoreCheck(req.currentStore, stores)
                ? combinedBaseQuery(req, stores, keyword)
                : serviceOnlyBaseQuery(req, stores, keyword);
            const result = await Order.query().knex().raw(`
            ${baseQuery} ${orderByQuery(sortBy, sortOrder, orderBy)} limit 10 offset ${
                (page - 1) * 10
            }
        `);
            const { resp, totalOrders } = mapResponse(result.rows);
            response = resp;
            totalOrderCount = totalOrders;
        }

        res.status(200).json({
            success: true,
            totalOrders: totalOrderCount,
            orders: response,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = ordersList;

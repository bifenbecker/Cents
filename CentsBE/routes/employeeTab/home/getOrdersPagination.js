const Joi = require('@hapi/joi');

const { raw } = require('objection');

const ServiceOrder = require('../../../models/serviceOrders');
const StoreCustomer = require('../../../models/storeCustomer');
const Store = require('../../../models/store');
const ServiceOrderItem = require('../../../models/serviceOrderItem');
const { returnSubQuery } = require('../customers/search');
const payments = require('../../../models/payment');
const getOrderCodePrefix = require('../../../utils/getOrderCodePrefix');
const { orderDeliveryStatuses } = require('../../../constants/constants');

// renaming asc and desc to up and down.
const sortObject = {
    up: 'asc',
    down: 'desc',
};

function validatePageNumber(input) {
    const schema = Joi.object().keys({
        withoutPagination: Joi.boolean().optional(),
        statuses: Joi.array().optional().allow(null, ''),
        stores: Joi.array().optional().allow(null, ''),
        page: Joi.when('withoutPagination', {
            is: true,
            then: Joi.any(),
            otherwise: Joi.number().integer().min(1).required(),
        }),
        sortBy: Joi.string()
            .valid('id', 'name', 'placedAt', 'paymentStatus', 'bagCount', 'storeName', 'status')
            .optional()
            .allow(null, ''),
        orderBy: Joi.string().valid('location').optional().allow(null, ''),
        sortOrder: Joi.string().when('sortBy', {
            is: Joi.string().valid(
                'id',
                'name',
                'placedAt',
                'paymentStatus',
                'bagCount',
                'storeName',
                'status',
            ),
            then: Joi.string().valid(Object.keys(sortObject)).optional(),
            otherwise: Joi.any().optional(),
        }),
    });
    const validate = Joi.validate(input, schema);
    return validate;
}

async function validateStores(stores) {
    try {
        await Store.query().whereIn('id', stores).select('id');
    } catch (e) {
        throw new Error('STORE_IDS_ARE_NOT_VALID');
    }
}
function mapResponse(orders) {
    const response = {};
    let orderCount = 0;
    const resp = [];
    for (const order of orders) {
        const temp = {
            ...order,
        };
        orderCount = order.total_count;
        temp.orderCodeWithPrefix = getOrderCodePrefix(order);
        temp.fullName = order.boFullName ? order.boFullName : order.fullName;
        delete temp.boFullName;
        temp.hubName = order.hubName ? order.hubName : '';
        temp.rack = order.rack ? order.rack : '';
        temp.hubAddress = order.hubAddress ? order.hubAddress : '';
        temp.notes = order.notes ? order.notes : '';
        temp.completedAt = order.completedAt ? order.completedAt : '';
        temp.serviceOrderWeights = temp.serviceOrderWeights
            ? temp.serviceOrderWeights.filter((sow) => sow.id != null)
            : [];
        temp.bagCount = order.bagCount || 0;
        temp.serviceOrderBags = temp.serviceOrderBags || [];
        temp.orderItemId =
            temp.serviceOrderWeights && temp.serviceOrderWeights.length
                ? temp.serviceOrderWeights[0].orderItemId
                : '';
        resp.push(temp);
        delete temp.statusId;
        delete temp.total_count;
    }
    response.totalOrders = Number(orderCount);
    response.resp = resp;
    return response;
}

function orderByHelper(orders, sortBy, sortOrder, orderBy) {
    let query;
    if (sortBy === 'id' || sortBy === 'placedAt') {
        query = orders.orderByRaw(
            `${orderBy === 'location' ? '"storeName" asc ,' : ''} "${sortBy}" ${
                sortOrder === 'up' ? sortObject.up : sortObject.down
            }`,
        );
    } else if (sortBy === 'storeName') {
        query = orders.orderByRaw(`${sortOrder === 'up' ? '"storeName" asc' : '"storeName" desc'}`);
    } else {
        query = orders.orderByRaw(
            `${orderBy === 'location' ? '"storeName" asc ,' : ''} "${sortBy}" ${
                sortOrder === 'down' ? sortObject.down : sortObject.up
            }`,
        );
    }
    return query;
}

// sort for statuses.
function statusSubQuery(orders, sortOrder, orderBy) {
    /**
     * Order of statuses:
     * 1. READY_FOR_PROCESSING
     * 2. DESIGNATED_FOR_PROCESSING_AT_HUB
     * 3. IN_TRANSIT_TO_HUB
     * 4. DROPPED_OFF_AT_HUB
     * 5. RECEIVED_AT_HUB_FOR_PROCESSING
     * 6. PROCESSING
     * 7. HUB_PROCESSING_ORDER
     * 8. HUB_PROCESSING_COMPLETE
     * 9. IN_TRANSIT_TO_STORE
     * 10. DROPPED_OFF_AT_STORE
     * 11. READY_FOR_PICKUP
     * 12. COMPLETED
     * 13. CANCELLED
     * 14. PAYMENT_REQUIRED
     */
    let query = orders.select(
        raw(`
    case
    when "${ServiceOrder.tableName}"."status" = 'READY_FOR_PROCESSING' then 1
    when "${ServiceOrder.tableName}"."status" = 'DESIGNATED_FOR_PROCESSING_AT_HUB' then 2
    when "${ServiceOrder.tableName}"."status" = 'IN_TRANSIT_TO_HUB' then 3
    when "${ServiceOrder.tableName}"."status" = 'DROPPED_OFF_AT_HUB' then 4
    when "${ServiceOrder.tableName}"."status" = 'RECEIVED_AT_HUB_FOR_PROCESSING' then 5
    when "${ServiceOrder.tableName}"."status" = 'PROCESSING' then 6
    when "${ServiceOrder.tableName}"."status" = 'HUB_PROCESSING_ORDER' then 7
    when "${ServiceOrder.tableName}"."status" = 'HUB_PROCESSING_COMPLETE' then 8
    when "${ServiceOrder.tableName}"."status" = 'IN_TRANSIT_TO_STORE' then 9
    when "${ServiceOrder.tableName}"."status" = 'DROPPED_OFF_AT_STORE' then 10
    when "${ServiceOrder.tableName}"."status" = 'READY_FOR_PICKUP' then 11
    when "${ServiceOrder.tableName}"."status" = 'COMPLETED' then 12
    when "${ServiceOrder.tableName}"."status" = 'CANCELLED' then 13
    when "${ServiceOrder.tableName}"."status" = 'PAYMENT_REQUIRED' then 14
    else 15
    end as "statusId"
    `),
    );
    query = orderByHelper(query, 'statusId', sortOrder, orderBy);
    return query;
}

function sortByField(sortBy, orders, sortOrder, orderBy) {
    if (sortBy === 'name') {
        return orderByHelper(orders, 'fullName', sortOrder, orderBy);
    }
    if (sortBy === 'status') {
        return statusSubQuery(orders, sortOrder, orderBy);
    }
    return orderByHelper(orders, sortBy, sortOrder, orderBy);
}

/*
    filterBySearch() function returns an orders query which filters using keyword
*/
function filterBySearch(keyword, orders) {
    return keyword
        ? orders.where((q) => {
              let builder = q;
              builder
                  .where((query) => {
                      returnSubQuery(query, 'phoneNumber', 'phoneNumber', keyword);
                  })
                  .orWhere((query) => {
                      query.where('storeCustomers.email', 'ilike', `%${keyword}%`);
                      // returnSubQuery(query, 'email', 'email', keyword);
                  })
                  .orWhere((query) => {
                      query
                          .where(
                              raw(
                                  'concat("storeCustomers"."firstName",  \' \' ,"storeCustomers"."lastName")',
                              ),
                              'ilike',
                              `%${keyword}%`,
                          )
                          .orWhere(
                              raw(
                                  'concat("centsCustomers"."firstName",  \' \' ,"centsCustomers"."lastName")',
                              ),
                              'ilike',
                              `%${keyword}%`,
                          );
                  });
              builder = Number(keyword)
                  ? builder.orWhere(
                        raw(`"${ServiceOrder.tableName}"."orderCode"`),
                        'ilike',
                        `%${keyword}%`,
                    )
                  : builder;
          })
        : orders;
}

/*
    getFilterByLocationQuery() function returns an orders query which filters out only
    certain locations/stores orders in employee app for hubs via location picker.
    stores: is an array which accepts storeIds, based on that, only those store/location orders
    will be returned in the API response
*/
function getFilterByLocationQuery(keyword, store, stores, orders, statuses) {
    // if the storeId param consists of its own ID then include itself and other store orders
    // else send the stores picked and return their orders
    let updatedOrdersQuery;
    if (stores.includes(store.id.toString())) {
        updatedOrdersQuery = orders.where(`${ServiceOrder.tableName}.storeId`, store.id);
        updatedOrdersQuery = filterBySearch(keyword, orders);
        updatedOrdersQuery = updatedOrdersQuery
            .whereIn(`${ServiceOrder.tableName}.status`, statuses)
            .orWhereIn(`${ServiceOrder.tableName}.storeId`, stores)
            .andWhere(`${ServiceOrder.tableName}.hubId`, store.id);
    } else {
        updatedOrdersQuery = orders
            .whereIn(`${ServiceOrder.tableName}.storeId`, stores)
            .andWhere(`${ServiceOrder.tableName}.hubId`, store.id);
    }
    return updatedOrdersQuery;
}

async function getOrdersQuery(
    store,
    stores,
    orderId,
    statuses,
    page,
    keyword,
    sortBy,
    sortOrder,
    orderBy,
    withoutPagination,
) {
    const { isHub } = store;
    let orders = ServiceOrder.query()
        .select(
            raw(`count("${ServiceOrder.tableName}"."id") OVER() AS "total_count"`),
            `${ServiceOrder.tableName}.id as id`,
            `${ServiceOrder.tableName}.isBagTrackingEnabled as isBagTrackingEnabled`,
            `${ServiceOrder.tableName}.placedAt as placedAt`,
            `${ServiceOrder.tableName}.completedAt as completedAt`,
            `${ServiceOrder.tableName}.rack`,
            raw(
                '"storeCustomers"."firstName" || \' \'|| "storeCustomers"."lastName" as "boFullName"',
            ),
            raw(
                '"centsCustomers"."firstName" || \' \'|| "centsCustomers"."lastName" as "fullName"',
            ),
            raw(`jsonb_build_object (
                    'centsCustomerId', "centsCustomers".id
                    ,'firstName', "centsCustomers"."firstName"
                    ,'lastName', "centsCustomers"."lastName"
                    ,'phoneNumber', "centsCustomers"."phoneNumber"
                    ,'email', "centsCustomers"."email"
                ) as "customer"`),
            `${ServiceOrder.tableName}.isProcessedAtHub`,
            `${ServiceOrder.tableName}.orderType`,
            `${ServiceOrder.tableName}.storeId`,
            `${ServiceOrder.tableName}.hubId`,
            `${ServiceOrder.tableName}.status`,
            `${ServiceOrder.tableName}.notes`,
            raw(`LOWER ( "${Store.tableName}"."name" ) as "storeName"`),
            'stores.address as storeAddress',
            'hub.name as hubName',
            'hub.address as hubAddress',
            `${ServiceOrder.tableName}.paymentStatus`,
            `${ServiceOrder.tableName}.paymentTiming`,
            `${ServiceOrder.tableName}.orderCode`,
            raw(`json_agg( distinct jsonb_build_object
        (
        'id', ${payments.tableName}.id
        ,'status', ${payments.tableName}."status"
        ,'paymentToken', ${payments.tableName}."paymentToken"
        ,'totalAmount', ${payments.tableName}."totalAmount"
        ,'paymentProcessor', ${payments.tableName}."paymentProcessor"
        ,'paymentMemo', ${payments.tableName}."paymentMemo"
        ,'esdReceiptNumber', ${payments.tableName}."esdReceiptNumber"
        ,'stripeClientSecret', ${payments.tableName}."stripeClientSecret"
        )) as "payments",
        sum("lineItemDetails"."lineItemQuantity") as "lineItemQuantity"
        `),
            raw(`json_agg ( distinct jsonb_build_object
            (
                'id', "serviceOrderBags".id
                ,'serviceOrderId', "serviceOrderBags"."serviceOrderId"
                ,'description', "serviceOrderBags"."description"
                ,'barcode', "serviceOrderBags"."barcode"
                ,'barcodeStatus', "serviceOrderBags"."barcodeStatus"
                ,'isActiveBarcode', "serviceOrderBags"."isActiveBarcode"
                ,'notes', "serviceOrderBags"."notes"
            )) as "serviceOrderBags", count(distinct "serviceOrderBags"."id") as "bagCount"`),
            raw(`json_agg ( distinct jsonb_build_object
                (
                    'id', "serviceOrderWeights".id
                    ,'teamMemberId', "serviceOrderWeights"."teamMemberId"
                    ,'step', "serviceOrderWeights"."step"
                    ,'totalWeight', "serviceOrderWeights"."totalWeight"
                    ,'chargeableWeight', "serviceOrderWeights"."chargeableWeight"
                    ,'status', "serviceOrderWeights"."status"
                )) as "serviceOrderWeights"`),
            'serviceOrders.netOrderTotal',
            'serviceOrders.promotionId',
            'orders.id as orderId',
            'orders.orderableId as orderableId',
            'orders.orderableType as orderableType',
            'orderDeliveries.id as deliveryId',
        )
        // .leftJoin('users', `${ServiceOrder.tableName}.userId`, 'users.id')
        // .leftJoin('secondaryDetails', 'users.id', 'secondaryDetails.userId')
        .leftJoin(
            `${StoreCustomer.tableName}`,
            `${ServiceOrder.tableName}.storeCustomerId`,
            `${StoreCustomer.tableName}.id`,
        )
        .leftJoin('centsCustomers', 'centsCustomers.id', 'storeCustomers.centsCustomerId')
        .leftJoin(
            `${ServiceOrderItem.tableName} as orderItems`,
            `${ServiceOrder.tableName}.id`,
            'orderItems.orderId',
        )
        .leftJoin(
            'serviceReferenceItems as referenceItems',
            'referenceItems.orderItemId',
            'orderItems.id',
        )
        .leftJoin(
            'serviceReferenceItemDetails as lineItemDetails',
            'lineItemDetails.serviceReferenceItemId',
            'referenceItems.id',
        )
        .leftJoin('stores', `${ServiceOrder.tableName}.storeId`, 'stores.id')
        .leftJoin('stores as hub', `${ServiceOrder.tableName}.hubId`, 'hub.id')
        .leftJoin('serviceOrderWeights', 'serviceOrderWeights.serviceOrderId', 'serviceOrders.id')
        .leftJoin('serviceOrderBags', 'serviceOrderBags.serviceOrderId', 'serviceOrders.id')
        .leftJoin('orders', (builder) => {
            builder
                .on('serviceOrders.id', '=', 'orders.orderableId')
                .onIn('orders.orderableType', ['ServiceOrder', 'serviceOrder']);
        })
        .leftJoin('orderDeliveries', (builder) => {
            builder
                .on('orderDeliveries.orderId', 'orders.id')
                .andOn('orderDeliveries.type', raw("'RETURN'"))
                .onNotIn('orderDeliveries.status', [
                    orderDeliveryStatuses.FAILED,
                    'CANCELLED',
                    orderDeliveryStatuses.CANCELED,
                    orderDeliveryStatuses.COMPLETED,
                ]);
        })

        .leftJoin('payments', 'payments.orderId', 'orders.id');

    // check if the current store is hub or not.
    if (isHub) {
        orders = stores
            ? getFilterByLocationQuery(keyword, store, stores, orders, statuses)
            : orders.where((q) => {
                  q.where(`${ServiceOrder.tableName}.storeId`, store.id).orWhere(
                      `${ServiceOrder.tableName}.hubId`,
                      store.id,
                  );
              });
    } else {
        orders = orders.where(`${ServiceOrder.tableName}.storeId`, store.id);
    }

    if (statuses && statuses.length) {
        // apply statuses
        orders = orders.whereIn(`${ServiceOrder.tableName}.status`, statuses);
    } else {
        // filter only active orders.
        orders = orders
            .where(`${ServiceOrder.tableName}.status`, '<>', 'COMPLETED')
            .andWhere(`${ServiceOrder.tableName}.status`, '<>', 'CANCELLED');
    }
    // order search
    orders = filterBySearch(keyword, orders);

    if (sortBy) {
        orders = sortByField(sortBy, orders, sortOrder, orderBy);
    } else {
        const orderClause = [{ column: `${ServiceOrder.tableName}.id`, order: 'desc' }];
        if (orderBy === 'location') {
            orderClause.unshift('storeName');
        }
        orders = orders.orderBy(orderClause);
    }
    if (orderId) {
        orders = orders.where(`${ServiceOrder.tableName}.id`, orderId);
    }
    orders = withoutPagination ? orders : orders.limit(10).offset((page - 1) * 10);
    orders = orders.groupBy(
        `${ServiceOrder.tableName}.id`,
        'storeCustomers.id',
        'centsCustomers.id',
        'stores.id',
        'hub.id',
        'orders.id',
        'orderDeliveries.id',
    );
    orders = await orders;
    return mapResponse(orders);
}

async function getOrders(req, res, next) {
    try {
        const { statuses, stores, page, sortBy, sortOrder, orderBy } = req.query;
        const isPageValid = validatePageNumber({
            page,
            statuses,
            stores,
            sortBy,
            sortOrder,
            withoutPagination: false,
            orderBy,
        });
        if (isPageValid.error) {
            res.status(422).json({
                error: isPageValid.error.message,
            });
            return;
        }
        if (stores) {
            try {
                await validateStores(stores);
            } catch (e) {
                res.status(422).json({
                    error: 'Store Ids are Invalid',
                });
                return;
            }
        }
        const store = req.currentStore;
        const orderId = null;
        const { resp, totalOrders } = await getOrdersQuery(
            store,
            stores,
            orderId,
            statuses,
            page,
            '',
            sortBy,
            sortOrder,
            orderBy,
        );
        res.json({
            success: true,
            totalOrders,
            orders: resp,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = {
    getOrders,
    mapResponse,
    getOrdersQuery,
    validatePageNumber,
    validateStores,
    filterBySearch,
};

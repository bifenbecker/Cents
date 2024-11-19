// Packages
const { raw } = require('objection');
const momenttz = require('moment-timezone');
const { transaction } = require('objection');
const { flattenDeep } = require('lodash');

// Models
const Order = require('../../../models/orders');
const Store = require('../../../models/store');
const ServiceOrder = require('../../../models/serviceOrders');
const InventoryOrder = require('../../../models/inventoryOrders');
const CentsCustomer = require('../../../models/centsCustomer');
const TeamMember = require('../../../models/teamMember');
const Inventory = require('../../../models/inventory');
const StoreCustomer = require('../../../models/storeCustomer');
const User = require('../../../models/user');

// Utils
const getBusiness = require('../../../utils/getBusiness');
const assignedStoreIds = require('../../../utils/getAssignedStoreIds');
const { isValidReport } = require('../../../uow/reports');
const cashDrawerUtils = require('../../../uow/reports/cashDrawer/utils');
const {
    getFormattedStartAndEndDates,
    getPaymentType,
} = require('../../../utils/reports/reportsUtils');
const reportUtils = require('../../../utils/reports/reportsUtils');

// Event
const eventEmitter = require('../../../config/eventEmitter');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');
const CustomQuery = require('../../../services/customQuery');
const InventoryCategory = require('../../../models/inventoryCategory');
const ServiceCategoryType = require('../../../models/serviceCategoryType');
const {
    serviceCategoryTypes,
    statuses,
    inventoryOrderStatuses,
} = require('../../../constants/constants');

const { REPORT_TYPES } = require('../../../constants/constants');

/**
 * Generate revenue breakdown based on payment method
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 * @returns {Object} JSON response containing revenue details
 */
async function getRevenueByPaymentMethod(req, res, next) {
    try {
        const business = await getBusiness(req);
        const { startDate, endDate, timeZone, stores, allStoresCheck } = req.query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const storesFilter =
            allStoresCheck === 'true'
                ? await Store.query()
                      .select('id')
                      .where({ businessId: business.id })
                      .then((items) => items.map((item) => item.id))
                : stores;

        const payments = await Store.query()
            .select(
                'stores.id as storeId',
                'stores.name as storeName',
                'laundromatBusiness.name as businessName',
                'laundromatBusiness.id as businessId',
                raw(`
          (
            SELECT sum("payments"."appliedAmount")
            FROM "payments"
            JOIN "stores" as "s2" on "s2"."id" = "payments"."storeId"
            JOIN "laundromatBusiness" on "laundromatBusiness"."id" = "s2"."businessId"
            JOIN "storeSettings" on "storeSettings"."storeId" = "s2"."id"
            WHERE "payments"."paymentProcessor" = 'cash'
            AND "stores"."id" = "s2"."id"
            AND "laundromatBusiness"."id" = ${business.id}
            AND CAST("payments"."createdAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
            AND "payments"."status" = 'succeeded'
          ) AS "cashRevenue"
        `),
                raw(`
          (
            SELECT sum("payments"."appliedAmount")
            FROM "payments"
            JOIN "stores" as "s1" on "s1"."id" = "payments"."storeId"
            JOIN "laundromatBusiness" on "laundromatBusiness"."id" = "s1"."businessId"
            JOIN "storeSettings" on "storeSettings"."storeId" = "s1"."id"
            WHERE "payments"."paymentProcessor" = 'stripe'
            AND "stores"."id" = "s1"."id"
            AND "laundromatBusiness"."id" = ${business.id}
            AND CAST("payments"."createdAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
            AND "payments"."status" = 'succeeded'
          ) AS "creditCardRevenue"
        `),
                raw(`
          (
            SELECT sum("payments"."appliedAmount")
            FROM "payments"
            JOIN "stores" as "s1" on "s1"."id" = "payments"."storeId"
            JOIN "laundromatBusiness" on "laundromatBusiness"."id" = "s1"."businessId"
            JOIN "storeSettings" on "storeSettings"."storeId" = "s1"."id"
            WHERE ("payments"."paymentProcessor" = 'stripe' OR "payments"."paymentProcessor" = 'cash')
            AND "stores"."id" = "s1"."id"
            AND "laundromatBusiness"."id" = ${business.id}
            AND CAST("payments"."createdAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
            AND "payments"."status" = 'succeeded'
          ) AS "totalRevenue"
        `),
                raw(`
          (
            SELECT sum("payments"."appliedAmount")
            FROM "payments"
            JOIN "stores" as "s3" on "s3"."id" = "payments"."storeId"
            JOIN "laundromatBusiness" on "laundromatBusiness"."id" = "s3"."businessId"
            JOIN "storeSettings" on "storeSettings"."storeId" = "s3"."id"
            WHERE ("payments"."paymentProcessor" = 'CCI'
            OR "payments"."paymentProcessor" = 'ESD'
            OR "payments"."paymentProcessor" = 'Laundroworks'
            OR "payments"."paymentProcessor" = 'cashCard')
            AND "stores"."id" = "s3"."id"
            AND "laundromatBusiness"."id" = ${business.id}
            AND CAST("payments"."createdAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
            AND "payments"."status" = 'succeeded'
          ) AS "cashCardRevenue"
        `),
                raw(`
          (
            SELECT sum("payments"."appliedAmount")
            FROM "payments"
            JOIN "stores" as "s3" on "s3"."id" = "payments"."storeId"
            JOIN "laundromatBusiness" on "laundromatBusiness"."id" = "s3"."businessId"
            WHERE "payments"."paymentProcessor" = 'other'
            AND "stores"."id" = "s3"."id"
            AND "laundromatBusiness"."id" = ${business.id}
            AND CAST("payments"."createdAt" AT TIME ZONE '${timeZone}' AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
            AND "payments"."status" = 'succeeded'
          ) AS "otherRevenue"
        `),
            )
            .join('payments', 'payments.storeId', 'stores.id')
            .join('laundromatBusiness', 'laundromatBusiness.id', 'stores.businessId')
            .where('payments.status', 'succeeded')
            .andWhere('stores.businessId', business.id)
            .whereIn('stores.id', storesFilter)
            .whereBetween('payments.createdAt', [finalStartDate, finalEndDate])
            .groupBy('stores.id', 'laundromatBusiness.id');

        return res.json({
            success: true,
            revenue: payments,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get the average netOrderTotal for ServiceOrders based on provided parameters
 *
 * Params include:
 *
 * 1) startDate
 * 2) endDate
 * 3) timeZone;
 * 4) stores;
 * 5) allStoresCheck
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getAverageServiceOrderTotal(req, res, next) {
    try {
        const business = await getBusiness(req);
        const { startDate, endDate, timeZone, stores, allStoresCheck, status } = req.query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const storesFilter =
            allStoresCheck === 'true'
                ? await Store.query()
                      .select('id')
                      .where({ businessId: business.id })
                      .then((items) => items.map((item) => item.id))
                : stores;

        const serviceOrders = await ServiceOrder.query()
            .select('stores.name as storeName')
            .avg({ netOrderTotal: 'serviceOrders.netOrderTotal' })
            .join('stores', 'stores.id', 'serviceOrders.storeId')
            .whereIn('serviceOrders.storeId', storesFilter)
            .whereBetween('serviceOrders.placedAt', [finalStartDate, finalEndDate])
            .modify((queryBuilder) => {
                if (status === 'COMPLETED_AND_ACTIVE') {
                    queryBuilder.andWhere('serviceOrders.status', '<>', 'CANCELLED');
                }
                if (status === 'COMPLETED') {
                    queryBuilder.andWhere('serviceOrders.status', 'COMPLETED');
                }
                if (status === 'ACTIVE') {
                    queryBuilder
                        .andWhere('serviceOrders.status', '<>', 'COMPLETED')
                        .andWhere('serviceOrders.status', '<>', 'CANCELLED');
                }
            })
            .groupBy('stores.name');

        return res.json({
            success: true,
            serviceOrders,
        });
    } catch (error) {
        return next(error);
    }
}

async function getOrderDeliveries(req, res, next) {
    try {
        const queryParams = req.query;
        const { startDate, endDate, timeZone, deliveryProvider, userId } = queryParams;
        let { stores = [] } = queryParams;
        const allStoresChecked = queryParams.allStoresCheck === 'true';
        if (allStoresChecked) {
            const business = await getBusiness(req);
            stores = await assignedStoreIds(req.teamMemberId, req.currentUser.role, business.id);
        }

        const recipient = await User.query().findById(userId);
        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );
        const [futureStartDate, futureEndDate] = reportUtils.getSubscriptionFutureDates(
            finalStartDate,
            finalEndDate,
            timeZone,
        );
        const ownDriver = deliveryProvider === 'OWN_DRIVER';
        const doordash = deliveryProvider === 'DOORDASH';
        const options = {
            startDate: finalStartDate,
            endDate: finalEndDate,
            storeIds: stores,
            ownDriver,
            doordash,
            timeZone,
            storeCount: stores.length,
        };

        if (futureStartDate) {
            options.futureStartDate = futureStartDate;
            options.futureEndDate = futureEndDate;
        }

        eventEmitter.emit('downloadReport', {
            options,
            recipient,
            reportType: REPORT_TYPES.deliveriesReport,
        });
        return res.status(200).json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get the average netOrderTotal for InventoryOrders based on provided parameters
 *
 * Params include:
 *
 * 1) startDate
 * 2) endDate
 * 3) timeZone;
 * 4) stores;
 * 5) allStoresCheck
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getAverageInventoryOrderTotal(req, res, next) {
    try {
        const business = await getBusiness(req);
        const { startDate, endDate, timeZone, stores, allStoresCheck } = req.query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const storesFilter =
            allStoresCheck === 'true'
                ? await Store.query()
                      .select('id')
                      .where({ businessId: business.id })
                      .then((items) => items.map((item) => item.id))
                : stores;

        const inventoryOrders = await InventoryOrder.query()
            .select('stores.name as storeName')
            .avg({ netOrderTotal: 'inventoryOrders.netOrderTotal' })
            .join('stores', 'stores.id', 'inventoryOrders.storeId')
            .whereIn('inventoryOrders.storeId', storesFilter)
            .whereBetween('inventoryOrders.createdAt', [finalStartDate, finalEndDate])
            .groupBy('stores.name');

        return res.json({
            success: true,
            inventoryOrders,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get the average netOrderTotal for both ServiceOrders and InventoryOrders
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function getAverageCombinedOrderTotals(req, res, next) {
    try {
        const business = await getBusiness(req);
        const { startDate, endDate, timeZone, stores, allStoresCheck, status } = req.query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const storesFilter =
            allStoresCheck === 'true'
                ? await Store.query()
                      .select('id')
                      .where({ businessId: business.id })
                      .then((items) => items.map((item) => item.id))
                : stores;

        const orders = await Order.query()
            .select('stores.name as storeName')
            .avg({ inventoryOrderTotals: 'inventoryOrders.netOrderTotal' })
            .avg({ serviceOrderTotals: 'serviceOrders.netOrderTotal' })
            .join('stores', 'stores.id', 'orders.storeId')
            .innerJoin('storeSettings', 'storeSettings.storeId', 'orders.storeId')
            .leftJoin('serviceOrders', (table) => {
                table
                    .on('serviceOrders.id', '=', 'orders.orderableId')
                    .onIn('orders.orderableType', ['serviceOrder', 'ServiceOrder'])
                    .andOnIn('orders.storeId', storesFilter);
            })
            .leftJoin('inventoryOrders', (table) => {
                table
                    .on('inventoryOrders.id', '=', 'orders.orderableId')
                    .onIn('orders.orderableType', ['inventoryOrder', 'InventoryOrder'])
                    .andOnIn('orders.storeId', storesFilter);
            })
            .whereIn('orders.storeId', storesFilter)
            .whereRaw(
                `CAST("inventoryOrders"."createdAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'`,
            )
            .orWhere(
                raw(
                    `CAST("serviceOrders"."placedAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'`,
                ),
            )
            .modify((queryBuilder) => {
                if (status === 'COMPLETED_AND_ACTIVE') {
                    queryBuilder
                        .andWhere('serviceOrders.status', '<>', 'CANCELLED')
                        .whereIn('serviceOrders.storeId', storesFilter);
                }
                if (status === 'COMPLETED') {
                    queryBuilder
                        .andWhere('serviceOrders.status', 'COMPLETED')
                        .whereIn('serviceOrders.storeId', storesFilter);
                }
                if (status === 'ACTIVE') {
                    queryBuilder
                        .andWhere('serviceOrders.status', '<>', 'COMPLETED')
                        .andWhere('serviceOrders.status', '<>', 'CANCELLED')
                        .whereIn('serviceOrders.storeId', storesFilter);
                }
            })
            .groupBy('stores.name');

        return res.json({
            success: true,
            orders,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Retrieve a count and value of promotions applied based on given parameters
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getAppliedPromotionsData(req, res, next) {
    try {
        const business = await getBusiness(req);
        const { startDate, endDate, timeZone, stores, allStoresCheck } = req.query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const storesFilter =
            allStoresCheck === 'true'
                ? await Store.query()
                      .select('id')
                      .where({ businessId: business.id })
                      .then((items) => items.map((item) => item.id))
                : stores;

        const promotionsData = await StoreCustomer.query()
            .select(
                'businessPromotionPrograms.name as promotionCode',
                raw(
                    '"businessPromotionPrograms"."balanceRule"::json->\'explanation\' as "balanceRule"',
                ),
            )
            .count({ promoUses: 'si.promotionId' })
            .countDistinct({ customers: 'storeCustomers.centsCustomerId' })
            .sum({ totalPromotionValue: 'si.promotionAmount' })
            .join(
                raw(`(select "serviceOrders".id,"promotionAmount","promotionId","storeCustomerId"
            from "serviceOrders"
            join "storeSettings" on "storeSettings"."storeId" = "serviceOrders"."storeId"
            where "serviceOrders"."storeId" in (${storesFilter})
                and "serviceOrders"."promotionId" is not null
                and CAST("serviceOrders"."createdAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
            UNION
            select "inventoryOrders".id,"promotionAmount","promotionId","storeCustomerId"
            from "inventoryOrders"
            join "storeSettings" on "storeSettings"."storeId" = "inventoryOrders"."storeId"
            where "inventoryOrders"."storeId" in (${storesFilter})
                and "inventoryOrders"."promotionId" is not null
                and CAST("inventoryOrders"."createdAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}')`).as(
                    'si',
                ),
                'si.storeCustomerId',
                'storeCustomers.id',
            )
            .join('businessPromotionPrograms', 'businessPromotionPrograms.id', 'si.promotionId')
            .groupBy('businessPromotionPrograms.name', 'businessPromotionPrograms.balanceRule');
        return res.json({
            success: true,
            promotions: promotionsData,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get a list of new customers and first order info based on given parameters
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getNewCustomersData(req, res, next) {
    try {
        const business = await getBusiness(req);
        const { startDate, endDate, timeZone, stores, allStoresCheck } = req.query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const storesFilter =
            allStoresCheck === 'true'
                ? await Store.query()
                      .select('id')
                      .where({ businessId: business.id })
                      .then((items) => items.map((item) => item.id))
                : stores;

        const customQuery = new CustomQuery('reports/newCustomer-report.sql', {
            storesFilter,
            finalStartDate,
            finalEndDate,
        });
        const newCustomers = await customQuery.execute();

        return res.json({
            success: true,
            newCustomers,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get a breadown of team member statistics including:
 *
 * 1) employee full name
 * 2) total hours worked
 * 3) total sales value
 * 4) total orders processed
 * 5) lbs intaken
 * 6) lbs processed
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getTeamMemberTotalsReport(req, res, next) {
    try {
        const business = await getBusiness(req);
        const { startDate, endDate, timeZone, stores, allStoresCheck } = req.query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const storesFilter =
            allStoresCheck === 'true'
                ? await Store.query()
                      .select('id')
                      .where({ businessId: business.id })
                      .then((items) => items.map((item) => item.id))
                : stores;

        const teamMembers = await TeamMember.query()
            .select(
                raw(
                    'distinct(trim(concat("users"."firstname", \' \', "users"."lastname"))) as "fullName"',
                ),
                raw(
                    `
                    (
                        SELECT ROUND(
                            SUM(EXTRACT(EPOCH FROM CASE WHEN "tm1"."checkOutTime" IS NOT NULL THEN "tm1"."checkOutTime" ELSE NOW() END - "tm1"."checkInTime")/3600)
                        )
                        FROM "teamMembersCheckIn" "tm1"
                        JOIN "teamMembers" as "t1" on "t1"."id" = "tm1"."teamMemberId"
                        JOIN "stores" as "s1" on "s1"."id" = "tm1"."storeId"
                        JOIN "storeSettings" on "storeSettings"."storeId" = "s1"."id"
                        WHERE "tm1"."checkInTime" IS NOT NULL
                        AND "tm1"."checkOutTime" IS NOT NULL
                        AND "tm1"."teamMemberId" = "teamMembers"."id"
                        AND "stores"."id" = "s1"."id"
                        AND CAST("tm1"."checkInTime" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
                        GROUP BY "stores"."id", "teamMembers"."id"
                    ) AS "totalHoursWorked"
                `,
                ),
                raw(
                    `
                (
                    SELECT sum("serviceOrders"."orderTotal")
                    FROM "serviceOrders"
                    JOIN "stores" as "s1" on "s1"."id" = "serviceOrders"."storeId"
                    JOIN "storeSettings" on "storeSettings"."storeId" = "s1"."id"
                    WHERE "serviceOrders"."employeeCode" = "teamMembers"."id"
                    AND "stores"."id" = "s1"."id"
                    AND CAST("serviceOrders"."placedAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
                    GROUP BY "stores"."id"
                ) AS "totalSalesValue"
                `,
                ),
                raw(
                    `
                (
                    SELECT distinct(count("orderActivityLog"."orderId"))
                    FROM "orderActivityLog"
                    JOIN "teamMembers" as "t1" on "t1"."id" = "orderActivityLog"."teamMemberId"
                    JOIN "serviceOrders" as "sO1" on "sO1"."id" = "orderActivityLog"."orderId"
                    JOIN "stores" as "s1" on "s1"."id" = "sO1"."storeId"
                    JOIN "storeSettings" on "storeSettings"."storeId" = "s1"."id"
                    WHERE (
                        "orderActivityLog"."status" = 'READY_FOR_PICKUP'
                        OR "orderActivityLog"."status" = 'HUB_PROCESSING_COMPLETE'
                        OR "orderActivityLog"."status" = 'PROCESSING'
                        OR "orderActivityLog"."status" = 'HUB_PROCESSING_ORDER'
                    )
                    AND "t1"."id" = "teamMembers"."id"
                    AND "stores"."id" = "s1"."id"
                    AND CAST("orderActivityLog"."updatedAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
                    GROUP BY "stores"."id"
                ) AS "totalOrdersProcessed"
                `,
                ),
                raw(
                    `
                (
                    SELECT distinct(sum("serviceOrderWeights"."totalWeight"))
                    FROM "serviceOrderWeights"
                    JOIN "teamMembers" as "t1" on "t1"."id" = "serviceOrderWeights"."teamMemberId"
                    JOIN "serviceOrders" as "sO1" on "sO1"."id" = "serviceOrderWeights"."serviceOrderId"
                    JOIN "stores" as "s1" on "s1"."id" = "sO1"."storeId"
                    JOIN "storeSettings" on "storeSettings"."storeId" = "s1"."id"
                    WHERE "serviceOrderWeights"."step" = 1
                    AND "t1"."id" = "teamMembers"."id"
                    AND "stores"."id" = "s1"."id"
                    AND CAST("serviceOrderWeights"."createdAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
                    GROUP BY "stores"."id"
                ) AS "totalPoundsIntaken"
                `,
                ),
                raw(
                    `
                (
                    SELECT distinct(sum("serviceOrderWeights"."totalWeight"))
                    FROM "serviceOrderWeights"
                    JOIN "teamMembers" as "t1" on "t1"."id" = "serviceOrderWeights"."teamMemberId"
                    JOIN "serviceOrders" as "sO1" on "sO1"."id" = "serviceOrderWeights"."serviceOrderId"
                    JOIN "stores" as "s1" on "s1"."id" = "sO1"."storeId"
                    JOIN "storeSettings" on "storeSettings"."storeId" = "s1"."id"
                    WHERE (
                        "serviceOrderWeights"."status" = 'PROCESSING'
                        OR "serviceOrderWeights"."status" = 'READY_FOR_PICKUP'
                        OR "serviceOrderWeights"."status" = 'COMPLETED'
                        OR "serviceOrderWeights"."status" = 'HUB_PROCESSING_COMPLETE'
                    )
                    AND "t1"."id" = "teamMembers"."id"
                    AND "stores"."id" = "s1"."id"
                    AND CAST("serviceOrderWeights"."createdAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
                    GROUP BY "stores"."id"
                ) AS "totalPoundsProcessed"
                `,
                ),
                'stores.name',
            )
            .join('users', 'users.id', 'teamMembers.userId')
            .join('teamMembersCheckIn', 'teamMembersCheckIn.teamMemberId', 'teamMembers.id')
            .join('teamMemberStores', 'teamMemberStores.teamMemberId', 'teamMembers.id')
            .join('stores', 'stores.id', 'teamMemberStores.storeId')
            .join('laundromatBusiness', 'laundromatBusiness.id', 'stores.businessId')
            .whereIn('stores.id', storesFilter)
            .groupBy('stores.id', 'users.firstname', 'users.lastname', 'teamMembers.id');

        return res.json({
            success: true,
            teamMembers,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Retrieve team members involved in an order and the tip amount for the order
 *
 * Fields are:
 *
 * 1) order code;
 * 2) store name;
 * 3) order total;
 * 4) tip value;
 * 5) intake employee;
 * 6) washing employee;
 * 7) drying employee;
 * 8) complete processing employee;
 * 9) complete/pickup employee;
 * 10) pickup driver;
 * 11) delivery driver;
 *
 * @param {Object} req
 * @param {*} res
 * @param {*} next
 */
async function getTipsPerServiceOrderData(req, res, next) {
    try {
        const business = await getBusiness(req);
        const { startDate, endDate, timeZone, stores, allStoresCheck } = req.query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const storesFilter =
            allStoresCheck === 'true'
                ? await Store.query()
                      .select('id')
                      .where({ businessId: business.id })
                      .then((items) => items.map((item) => item.id))
                : stores;

        const tipsPerOrderServiceQuery = new CustomQuery('reports/tips-per-service-order.sql', {
            timeZone,
            startDate: finalStartDate,
            endDate: finalEndDate,
            storeIds: storesFilter.join(', '),
        });
        const tipsData = await tipsPerOrderServiceQuery.execute();

        return res.json({
            success: true,
            tips: tipsData,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Retrieve payouts data for Business Connect accounts from Stripe.
 *
 * Here the dates are not being formatted as the other reports are because
 * Stripe will throw an invalid integer error as it requires unix timestamps
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getPayoutsReport(req, res, next) {
    try {
        const business = await getBusiness(req);
        const stores = await business.getLocations();
        const { startDate, endDate, timeZone, userId } = req.query;

        const strippedStartDate = startDate.replace(/['"]+/g, '');
        const strippedEndDate = endDate.replace(/['"]+/g, '');
        const formattedStartDate = momenttz(strippedStartDate).tz(timeZone).startOf('day').unix();
        const formattedEndDate = momenttz(strippedEndDate).tz(timeZone).endOf('day').unix();

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const recipient = await User.query().findById(userId);
        const options = {
            timeZone,
            formattedStartDate,
            formattedEndDate,
            finalStartDate,
            finalEndDate,
            business,
            stores,
            storeCount: stores.length,
        };
        eventEmitter.emit('downloadReport', {
            options,
            recipient,
            reportType: REPORT_TYPES.stripePayoutReport,
        });

        return res.json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Retrieve all card/cash refunds from stripe.
 *
 * Here the dates are not being formatted as the other reports are because
 * Stripe will throw an invalid integer error as it requires unix timestamps
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getRefundsReport(req, res, next) {
    try {
        const business = await getBusiness(req);
        const stores = await business.getLocations();
        const { startDate, endDate, timeZone, userId, status } = req.query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const recipient = await User.query().findById(userId);
        const options = {
            timeZone,
            finalStartDate,
            finalEndDate,
            business,
            status,
            stores,
            storeCount: stores.length,
        };
        eventEmitter.emit('downloadReport', {
            options,
            recipient,
            reportType: REPORT_TYPES.stripeRefundsReport,
        });

        return res.json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get a breakdown of distinct available inventory and quantities for a selection of stores
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getInventoryCountReport(req, res, next) {
    try {
        const business = await getBusiness(req);
        const { stores, allStoresCheck } = req.query;

        let storesFilter =
            allStoresCheck === 'true'
                ? await Store.query()
                      .select('id')
                      .where({ businessId: business.id })
                      .then((items) => items.map((item) => item.id))
                : stores;
        storesFilter = storesFilter.map((store) => Number(store));

        const storesList = await Store.query().select('id', 'name').whereIn('id', storesFilter);
        const storeNames = storesList.map((store) => store.name);

        const inventory = await Inventory.query()
            .withGraphFetched('inventoryItems')
            .where({ isDeleted: false })
            .orderBy('productName', 'asc');

        const data = [['Inventory Product', ...storeNames]];

        inventory.forEach((item) => {
            const filteredStoreItems = item.inventoryItems.filter((obj) =>
                storesFilter.includes(obj.storeId),
            );
            const filteredQuantity = filteredStoreItems.map(
                (filteredItem) => filteredItem.quantity,
            );

            if (filteredStoreItems.length > 0) {
                data.push([item.productName, ...filteredQuantity]);
            }
        });

        return res.json({
            success: true,
            inventoryItems: data,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get a breakdown of cash drawer events for a given time period and store
 *
 * The report needs to include:
 *
 * 1) When the drawer was opened and by whom
 * 2) Beginning cash amount for that drawer
 * 3) List of cash transactions (sales or in/out) that occurred while the drawer was opened
 * 4) Expected cash value
 * 5) Actual reported cash in drawer
 * 6) Difference between the two
 * 7) When the drawer was closed and when
 *
 * For each end event, basically find the corresponding start event and work using that
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getCashDrawerReport(req, res, next) {
    let trx = null;
    try {
        const finalCashDrawer = {};
        const business = await getBusiness(req);
        const { startDate, endDate, timeZone, stores, allStoresCheck } = req.query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const storesFilter =
            allStoresCheck === 'true'
                ? await Store.query()
                      .select('id')
                      .where({ businessId: business.id })
                      .then((items) => items.map((item) => item.id))
                : stores;
        trx = await transaction.start(Store.knex());

        const storeCashEvents = await Store.query(trx)
            .withGraphJoined('[cashOutEvents, cashDrawerStartEvents]')
            .whereIn('stores.id', storesFilter)
            .andWhereBetween('cashDrawerStartEvents.createdAt', [finalStartDate, finalEndDate])
            .first();

        if (!storeCashEvents || !storeCashEvents.cashDrawerStartEvents) {
            await trx.rollback();
            return res.status(409).json({
                error: 'Cash drawer events do not exist for this store',
            });
        }

        finalCashDrawer.store = storeCashEvents.name;

        let detailedCashEvents = storeCashEvents.cashDrawerStartEvents.map((event) =>
            cashDrawerUtils.formatCashDrawerDetails(timeZone, storeCashEvents.id, event, trx),
        );

        detailedCashEvents = await Promise.all(detailedCashEvents);

        await trx.commit();

        return res.json({
            success: true,
            storeName: storeCashEvents.name,
            cashDrawerEvents: detailedCashEvents,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Generate a report that shows sales amounts per sales tax in use at the provided stores
 *
 * Report should include the following:
 *
 * 1) tax rate
 * 2) Locations using that tax rate
 * 3) total taxable product sales
 * 4) total taxable services
 * 5) tax amount charged
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getSalesTaxLiabilityReport(req, res, next) {
    try {
        const business = await getBusiness(req);
        const { startDate, endDate, timeZone, allStoresCheck } = req.query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const stores = Array.isArray(req.query.stores) ? req.query.stores : [req.query.stores];
        const storesFilter =
            allStoresCheck === 'true'
                ? await Store.query()
                      .select('id')
                      .where({ businessId: business.id })
                      .then((items) => items.map((item) => item.id))
                : stores;

        const salesTaxReportQuery = new CustomQuery('reports/sales-tax-report.sql', {
            timeZone,
            startDate: finalStartDate,
            endDate: finalEndDate,
            storeIds: storesFilter.join(', '),
        });
        const salesTaxReportData = await salesTaxReportQuery.execute();

        return res.json({
            success: true,
            taxRates: salesTaxReportData,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get sum total of values inside array
 *
 * @param {Array} array
 */
function getSumTotalsForArray(array) {
    const totals = array.reduce((previous, currentItem) => previous + currentItem, 0);
    return totals;
}

/**
 * Get a breakdown of sales per category for given locations and dates
 *
 * The report filters include:
 *
 * 1) active orders, completed orders, or both
 * 2) dates based on when order was placed
 *     - no requirement for filtering by date of successful payment
 *
 * Final report should have rows for:
 *
 * 1) Per Pound Service Sales - currently based on category field in line items
 * 2) Fixed Price Service Sales - currently based on category field in line items
 * 3) Product Sales - sum of inventory orders and line items in service orders
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getSalesByServiceCategoryReport(req, res, next) {
    try {
        const business = await getBusiness(req);
        const { startDate, endDate, timeZone, stores, allStoresCheck, status } = req.query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const storesFilter =
            allStoresCheck === 'true'
                ? await Store.query()
                      .select('id')
                      .where({ businessId: business.id })
                      .then((items) => items.map((item) => item.id))
                : stores;

        const serviceOrderSales = await ServiceOrder.query()
            .withGraphJoined(`[orderItems.referenceItems.[lineItemDetail],store.[settings]]`)
            .modifyGraph('orderItems', (builder) =>
                builder.where('serviceOrderItems.deletedAt', null),
            )
            .modifyGraph('orderItems.referenceItems', (builder) =>
                builder.where('serviceReferenceItems.deletedAt', null),
            )
            .whereIn('serviceOrders.storeId', storesFilter)
            .whereRaw(
                `CAST("serviceOrders"."placedAt" AT TIME ZONE "store:settings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'`,
            )
            .where((queryBuilder) => {
                if (status === 'COMPLETED_AND_ACTIVE') {
                    queryBuilder.where('serviceOrders.status', '<>', 'CANCELLED');
                }
                if (status === 'COMPLETED') {
                    queryBuilder.where('serviceOrders.status', 'COMPLETED');
                }
                if (status === 'ACTIVE') {
                    queryBuilder.whereNotIn('serviceOrders.status', ['COMPLETED', 'CANCELLED']);
                }
            });

        const inventoryOrderSales = await InventoryOrder.query()
            .withGraphJoined(`[lineItems,store.[settings]]`)
            .whereIn('inventoryOrders.storeId', storesFilter)
            .whereRaw(
                `CAST("inventoryOrders"."createdAt" AT TIME ZONE "store:settings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'`,
            )
            .where((queryBuilder) => {
                if (status === 'COMPLETED_AND_ACTIVE') {
                    queryBuilder.where('inventoryOrders.status', '<>', 'CANCELLED');
                }
                if (status === 'COMPLETED') {
                    queryBuilder.where('inventoryOrders.status', 'COMPLETED');
                }
                if (status === 'ACTIVE') {
                    queryBuilder.whereNotIn('inventoryOrders.status', ['COMPLETED', 'CANCELLED']);
                }
            });

        const lineItems = flattenDeep(
            serviceOrderSales.map((serviceOrder) =>
                serviceOrder.orderItems.map((item) => item.referenceItems[0].lineItemDetail),
            ),
        );

        const inventoryOrderLineItems = flattenDeep(
            inventoryOrderSales.map((inventoryOrder) => inventoryOrder.lineItems),
        );

        const perPoundLineItems = lineItems.filter((item) => item.category === 'PER_POUND');
        const perPoundTotals = perPoundLineItems.map((item) => item.lineItemTotalCost);

        const fixedPriceLineItems = lineItems.filter((item) => item.category === 'FIXED_PRICE');
        const fixedPriceTotals = fixedPriceLineItems.map((item) => item.lineItemTotalCost);

        const serviceOrderProductLineItems = lineItems.filter(
            (item) => item.soldItemType === 'InventoryItem',
        );
        const serviceOrderProductTotals = serviceOrderProductLineItems.map(
            (item) => item.lineItemTotalCost,
        );

        const inventoryOrderProductTotals = inventoryOrderLineItems.map(
            (item) => item.lineItemTotalCost,
        );

        const perPoundSales = getSumTotalsForArray(perPoundTotals);
        const fixedPriceSales = getSumTotalsForArray(fixedPriceTotals);
        const serviceOrderProductSales = getSumTotalsForArray(serviceOrderProductTotals);
        const inventoryOrderProductSales = getSumTotalsForArray(inventoryOrderProductTotals);

        return res.json({
            success: true,
            sales: {
                fixedPriceSales,
                perPoundSales,
                totalProductSales: serviceOrderProductSales + inventoryOrderProductSales,
                totalSales: Number(
                    fixedPriceSales +
                        perPoundSales +
                        serviceOrderProductSales +
                        inventoryOrderProductSales,
                ),
            },
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get a breakdown of sales per subcategory for given locations and dates
 *
 * The report filters include:
 *
 * 1) active orders, completed orders, or both // ?
 * 2) dates based on when order was placed
 *
 * Final report should have rows for categories:
 *
 * 1) Laundry (with subcategories)
 * 2) Dry Cleaning (with subcategories)
 * 3) Products (with subcategories)
 *
 * Also report should contain columns by payment method:
 *
 * 1) Credit Card
 * 2) Cash Card
 * 3) Cash
 * 4) Total (calculated on frontend as sum on columns values)
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getSalesByServiceSubCategoryReport(req, res, next) {
    try {
        const business = await getBusiness(req);
        const { startDate, endDate, timeZone, stores, allStoresCheck } = req.query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        let storesFilter;
        if (allStoresCheck === 'true') {
            storesFilter = await Store.query()
                .select('id')
                .where({ businessId: business.id })
                .then((items) => items.map((item) => item.id));
        } else {
            storesFilter = Array.isArray(stores) ? stores : [stores];
        }

        // Get orders
        const serviceOrderSales = await ServiceOrder.query()
            .withGraphJoined(
                `[orderItems.referenceItems.[lineItemDetail],store.[settings],order as orderMaster.[payments(succeededPayments)]]`,
            )
            .modifiers({
                succeededPayments: (query) => {
                    query.where({ status: 'succeeded' });
                },
            })
            .modifyGraph('orderItems', (builder) =>
                builder.where('serviceOrderItems.deletedAt', null),
            )
            .modifyGraph('orderItems.referenceItems', (builder) =>
                builder.where('serviceReferenceItems.deletedAt', null),
            )
            .whereIn('serviceOrders.storeId', storesFilter)
            .whereRaw(
                `CAST("serviceOrders"."placedAt" AT TIME ZONE "store:settings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'`,
            )
            .where((queryBuilder) => {
                queryBuilder.where('serviceOrders.status', statuses.COMPLETED);
            });

        const inventoryOrderSales = await InventoryOrder.query()
            .withGraphJoined(
                `[order.[payments(succeededPayments)], lineItems.[inventoryItem.[inventory.[inventoryCategory]]],store.[settings]]`,
            )
            .modifiers({
                succeededPayments: (query) => {
                    query.where({ status: 'succeeded' });
                },
            })
            .whereIn('inventoryOrders.storeId', storesFilter)
            .whereRaw(
                `CAST("inventoryOrders"."createdAt" AT TIME ZONE "store:settings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'`,
            )
            .where((queryBuilder) => {
                queryBuilder.where('inventoryOrders.status', inventoryOrderStatuses.COMPLETED);
            });

        // Get categories and subcategories
        const subcategoryDefaultAmounts = {
            creditCard: 0,
            cashCard: 0,
            cash: 0,
        };

        const productSubCategories = (
            await InventoryCategory.query()
                .select('name')
                .where('businessId', business.id)
                .where('deletedAt', null)
                .orderBy('name')
        ).map((category) => ({
            name: category.name,
            ...subcategoryDefaultAmounts,
        }));

        const servicesCategories = await ServiceCategoryType.query()
            .select('type', 'serviceCategories.category')
            .withGraphJoined('serviceCategories(alphabeticalCategoryType)')
            .modifiers({
                alphabeticalCategoryType: (query) => {
                    query.orderBy('category', 'asc');
                },
            })
            .where('serviceCategories.businessId', business.id)
            .andWhere('serviceCategories.deletedAt', null)
            .andWhereNot('serviceCategories.category', 'DELIVERY')
            .orderBy('type', 'asc');

        let dryCleaningSubCategories = [];
        let laundrySubCategories = [];

        servicesCategories.forEach((category) => {
            if (category.type === serviceCategoryTypes.DRY_CLEANING) {
                dryCleaningSubCategories = category.serviceCategories.map((serviceCategory) => ({
                    name: serviceCategory.category,
                    ...subcategoryDefaultAmounts,
                }));
            }
            if (category.type === serviceCategoryTypes.LAUNDRY) {
                laundrySubCategories = category.serviceCategories.map((serviceCategory) => ({
                    name: serviceCategory.category,
                    ...subcategoryDefaultAmounts,
                }));
            }
        });

        // Map items
        serviceOrderSales.forEach((serviceOrder) => {
            const { payments } = serviceOrder.orderMaster;
            if (!payments.length) return;

            let paymentType = getPaymentType(serviceOrder.orderMaster.payments[0].paymentProcessor);
            const { orderItems } = serviceOrder;
            const ordersMapping = [];

            if (payments.length > 1) {
                const multiOrderItems = [];

                // Group order items by creation time, so thus we know they were paid by the same payment
                orderItems.forEach((order) => {
                    const found = multiOrderItems.find(
                        (x) => x?.date.getTime() === order.createdAt.getTime(),
                    );
                    if (found) {
                        found.items.push(order);
                    } else {
                        multiOrderItems.push({
                            paymentType: '',
                            items: [order],
                            date: order.createdAt,
                        });
                    }
                });

                if (multiOrderItems.length === payments.length) {
                    multiOrderItems.sort((a, b) => new Date(b.date) - new Date(a.date));
                    payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    multiOrderItems.forEach((orderItem, i) => {
                        orderItem.items.forEach((item) => {
                            ordersMapping.push({
                                orderId: item.id,
                                paymentType: getPaymentType(payments[i].paymentProcessor),
                                paymentMemo: payments[i].paymentMemo,
                            });
                        });
                    });
                }
            }

            orderItems.forEach((orderItem) => {
                const itemDetails = orderItem.referenceItems[0].lineItemDetail;

                if (ordersMapping.length) {
                    const orderDetails = ordersMapping.find(
                        (mapI) => mapI.orderId === orderItem.id,
                    );
                    paymentType = orderDetails.paymentType;
                }

                if (itemDetails.lineItemTotalCost > 0) {
                    let subcategoriesToSearch;

                    if (itemDetails.soldItemType === 'InventoryItem') {
                        subcategoriesToSearch = productSubCategories;
                    } else if (
                        itemDetails.serviceCategoryType === serviceCategoryTypes.DRY_CLEANING
                    ) {
                        subcategoriesToSearch = dryCleaningSubCategories;
                    } else if (itemDetails.serviceCategoryType === serviceCategoryTypes.LAUNDRY) {
                        subcategoriesToSearch = laundrySubCategories;
                    } else {
                        return;
                    }

                    const subcategory = subcategoriesToSearch.find(
                        (subcategory) => itemDetails.category === subcategory.name,
                    );

                    if (subcategory) {
                        subcategory[paymentType] += itemDetails.lineItemTotalCost;
                    }
                }
            });
        });

        inventoryOrderSales.forEach((inventoryOrder) => {
            const paymentType = getPaymentType(inventoryOrder.order.payments[0].paymentProcessor);

            inventoryOrder.lineItems.forEach((lineItem) => {
                if (lineItem.lineItemTotalCost > 0) {
                    const subcategoryName = lineItem.inventoryItem.inventory.inventoryCategory.name;
                    const subcategory = productSubCategories.find(
                        (subcategory) => subcategoryName === subcategory.name,
                    );
                    if (subcategory) {
                        subcategory[paymentType] += lineItem.lineItemTotalCost;
                    }
                }
            });
        });

        return res.json({
            success: true,
            sales: {
                categories: [
                    { name: 'Laundry', subcategories: laundrySubCategories },
                    { name: 'Dry Cleaning', subcategories: dryCleaningSubCategories },
                    { name: 'Products', subcategories: productSubCategories },
                ],
            },
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Generate the specified report to be emailed to the recipient
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function generateReport(req, res, next) {
    const { userId, reportType } = req.query;

    try {
        const business = await getBusiness(req);
        if (!business) {
            const errMsg = 'Invalid request. No business exists';
            LoggerHandler('error', errMsg, req);
            return res.status(400).json({
                error: errMsg,
            });
        }

        const recipient = await User.query().findById(userId);

        // verify that the reportType is valid
        const isReportValid = isValidReport(reportType);
        if (!isReportValid) {
            const errMsg = `Invalid request. Report ${reportType} does not exist`;
            LoggerHandler('error', errMsg, req);
            return res.status(400).json({
                error: errMsg,
            });
        }

        const options = {
            ...req.query,
            businessId: business.id,
        };

        eventEmitter.emit('downloadReport', {
            options,
            recipient,
            reportType,
        });
        return res.status(200).json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
}

async function getSubscriptionsListReport(req, res, next) {
    try {
        const { userId, allStoresCheck } = req.query;
        let { stores = [] } = req.query;
        const allStoresChecked = allStoresCheck === 'true';
        if (allStoresChecked) {
            const business = await getBusiness(req);
            stores = await assignedStoreIds(req.teamMemberId, req.currentUser.role, business.id);
        }
        const recipient = await User.query().findById(userId);
        const options = {
            stores,
            storeCount: stores.length,
        };
        eventEmitter.emit('downloadReport', {
            options,
            recipient,
            reportType: REPORT_TYPES.subscriptionsReport,
        });

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

async function getCustomersReport(req, res, next) {
    try {
        const business = await getBusiness(req);
        const { startDate, endDate, timeZone, allStoresCheck } = req.query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const stores = Array.isArray(req.query.stores) ? req.query.stores : [req.query.stores];
        const storesFilter =
            allStoresCheck === 'true'
                ? await Store.query()
                      .select('id')
                      .where({ businessId: business.id })
                      .then((items) => items.map((item) => item.id))
                : stores;

        let customers = await CentsCustomer.query()
            .select(
                raw(
                    'distinct(trim(concat("centsCustomers"."firstName", \' \', "centsCustomers"."lastName"))) as "customerName"',
                ),
                raw('"storeSettings"."timeZone" as "timeZone"'),
                raw('"centsCustomers"."email" as "customerEmail"'),
                raw('"centsCustomers"."phoneNumber" as "customerPhoneNumber"'),
                raw(`
                    (
                      SELECT "businessCustomers"."isCommercial"
                      FROM "businessCustomers"
                      WHERE "centsCustomers".id = "businessCustomers"."centsCustomerId" 
                      AND "businessCustomers"."deletedAt" is null
                      LIMIT 1
                    ) AS "isCommercial"
                `),
                raw(
                    `TO_CHAR("centsCustomers"."createdAt" AT TIME ZONE "storeSettings"."timeZone", 'MM/DD/YYYY') as "registerDate"`,
                ),
                raw(`
                    (
                      SELECT "stores1"."name"
                      FROM "serviceOrders"
                      JOIN "stores" as "stores1" on "stores1"."id" = "serviceOrders"."storeId"
                      JOIN "storeCustomers" on "storeCustomers"."id" = "serviceOrders"."storeCustomerId"
                      WHERE "storeCustomers".id = "serviceOrders"."storeCustomerId"
                      AND "storeCustomers"."centsCustomerId" = "centsCustomers"."id"
                      LIMIT 1
                    ) AS "registerLocation"
                `),
                raw(`
                    (
                      SELECT COUNT(*)
                      FROM "serviceOrders"
                      WHERE "serviceOrders"."storeCustomerId" = "storeCustomers"."id"
                      AND "storeCustomers"."centsCustomerId" = "centsCustomers"."id"
                    ) AS "totalOrders"
                `),
                raw(`
                    (
                      SELECT SUM("serviceOrders"."netOrderTotal")
                      FROM "serviceOrders"
                      WHERE "serviceOrders"."storeCustomerId" = "storeCustomers"."id"
                      AND "storeCustomers"."centsCustomerId" = "centsCustomers"."id"
                    ) AS "totalOrderValue"
                `),
                raw(`
                    (
                      SELECT AVG("serviceOrders"."netOrderTotal")
                      FROM "serviceOrders"
                      WHERE "serviceOrders"."storeCustomerId" = "storeCustomers"."id"
                      AND "storeCustomers"."centsCustomerId" = "centsCustomers"."id"
                    ) AS "averageOrderValue"
                `),
                raw(`
                    (
                      SELECT CAST("serviceOrders"."createdAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE)
                      FROM "serviceOrders"
                      WHERE "serviceOrders"."storeCustomerId" = "storeCustomers"."id"
                      AND "storeCustomers"."centsCustomerId" = "centsCustomers"."id"
                      ORDER BY "serviceOrders"."createdAt" ASC LIMIT 1
                    ) AS "firstOrderDate"
                `),
                raw(`
                    (
                      SELECT "serviceOrders"."netOrderTotal"
                      FROM "serviceOrders"
                      WHERE "serviceOrders"."storeCustomerId" = "storeCustomers"."id"
                      AND "storeCustomers"."centsCustomerId" = "centsCustomers"."id"
                      ORDER BY "serviceOrders"."createdAt" ASC LIMIT 1
                    ) AS "firstOrderValue"
                `),
                raw(`
                    (
                      SELECT CAST("serviceOrders"."createdAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE)
                      FROM "serviceOrders"
                      WHERE "serviceOrders"."storeCustomerId" = "storeCustomers"."id"
                      AND "storeCustomers"."centsCustomerId" = "centsCustomers"."id"
                      ORDER BY "serviceOrders"."createdAt" DESC LIMIT 1
                    ) AS "lastOrderDate"
                `),
                raw(`
                    (
                      SELECT "serviceOrders"."netOrderTotal"
                      FROM "serviceOrders"
                      WHERE "serviceOrders"."storeCustomerId" = "storeCustomers"."id"
                      AND "storeCustomers"."centsCustomerId" = "centsCustomers"."id"
                      ORDER BY "serviceOrders"."createdAt" DESC LIMIT 1
                    ) AS "lastOrderValue"
                `),
            )
            .join('storeCustomers', 'storeCustomers.centsCustomerId', 'centsCustomers.id')
            .join('stores', 'stores.id', 'storeCustomers.storeId')
            .innerJoin('storeSettings', 'storeSettings.storeId', 'stores.id')
            .join('serviceOrders', 'serviceOrders.storeCustomerId', 'storeCustomers.id')
            .join('businessCustomers', (query) => {
                query
                    .on('businessCustomers.centsCustomerId', 'centsCustomers.id')
                    .andOnNull('businessCustomers.deletedAt');
            })
            .whereIn('storeCustomers.storeId', storesFilter)
            .whereRaw(
                `CAST("centsCustomers"."createdAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'`,
            );

        customers = customers.map((customer) =>
            reportUtils.mapCustomersReportResponse(customer, customer.timeZone),
        );

        return res.json({
            success: true,
            customers,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = {
    generateReport,
    getOrderDeliveries,
    getRevenueByPaymentMethod,
    getAverageServiceOrderTotal,
    getAverageInventoryOrderTotal,
    getAppliedPromotionsData,
    getNewCustomersData,
    getTeamMemberTotalsReport,
    getTipsPerServiceOrderData,
    getPayoutsReport,
    getRefundsReport,
    getAverageCombinedOrderTotals,
    getInventoryCountReport,
    getCashDrawerReport,
    getSalesTaxLiabilityReport,
    getSalesByServiceCategoryReport,
    getSalesByServiceSubCategoryReport,
    getSubscriptionsListReport,
    getCustomersReport,
};

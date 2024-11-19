// Packages
const { raw } = require('objection');
const momenttz = require('moment-timezone');

// Models
const Order = require('../../../models/orders');
const Store = require('../../../models/store');
const ServiceOrder = require('../../../models/serviceOrders');
const CentsCustomer = require('../../../models/centsCustomer');
const TeamMember = require('../../../models/teamMember');
const InventoryItem = require('../../../models/inventoryItem');
const Payment = require('../../../models/payment');
const InventoryOrder = require('../../../models/inventoryOrders');

// Utils
const { weekMapping } = require('../../../constants/constants');
const {
    getFormattedStartAndEndDates,
    mapInventoryOrderDetails,
} = require('../../../utils/reports/reportsUtils');

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
        const { currentStore, query } = req;
        const { startDate, endDate, timeZone } = query;
        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const payments = await Store.query()
            .select(
                'stores.name as storeName',
                raw(`
          (
            SELECT to_char(sum("payments"."appliedAmount"), 'l99999D99')
            FROM "payments"
            JOIN "stores" as "s2" on "s2"."id" = "payments"."storeId"
            JOIN "laundromatBusiness" on "laundromatBusiness"."id" = "s2"."businessId"
            WHERE "payments"."paymentProcessor" = 'cash'
            AND "stores"."id" = "s2"."id"
            AND CAST("payments"."createdAt" AT TIME ZONE '${timeZone}' AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
          ) AS "cashRevenue"
        `),
                raw(`
          (
            SELECT to_char(sum("payments"."appliedAmount"), 'l99999D99')
            FROM "payments"
            JOIN "stores" as "s1" on "s1"."id" = "payments"."storeId"
            JOIN "laundromatBusiness" on "laundromatBusiness"."id" = "s1"."businessId"
            WHERE "payments"."paymentProcessor" = 'stripe'
            AND "stores"."id" = "s1"."id"
            AND CAST("payments"."createdAt" AT TIME ZONE '${timeZone}' AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
          ) AS "creditCardRevenue"
        `),
                raw(`
          (
            SELECT to_char(sum("payments"."appliedAmount"), 'l99999D99')
            FROM "payments"
            JOIN "stores" as "s1" on "s1"."id" = "payments"."storeId"
            JOIN "laundromatBusiness" on "laundromatBusiness"."id" = "s1"."businessId"
            WHERE ("payments"."paymentProcessor" = 'stripe' OR "payments"."paymentProcessor" = 'cash')
            AND "stores"."id" = "s1"."id"
            AND CAST("payments"."createdAt" AT TIME ZONE '${timeZone}' AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
          ) AS "totalRevenue"
        `),
                raw(`
          (
            SELECT to_char(sum("payments"."appliedAmount"), 'l99999D99')
            FROM "payments"
            JOIN "stores" as "s3" on "s3"."id" = "payments"."storeId"
            JOIN "laundromatBusiness" on "laundromatBusiness"."id" = "s3"."businessId"
            WHERE ("payments"."paymentProcessor" = 'CCI'
            OR "payments"."paymentProcessor" = 'ESD'
            OR "payments"."paymentProcessor" = 'Laundroworks'
            OR "payments"."paymentProcessor" = 'cashCard')
            AND "stores"."id" = "s3"."id"
            AND CAST("payments"."createdAt" AT TIME ZONE '${timeZone}' AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
          ) AS "cashCardRevenue"
        `),
                raw(`
          (
            SELECT to_char(sum("payments"."appliedAmount"), 'l99999D99')
            FROM "payments"
            JOIN "stores" as "s3" on "s3"."id" = "payments"."storeId"
            JOIN "laundromatBusiness" on "laundromatBusiness"."id" = "s3"."businessId"
            WHERE "payments"."paymentProcessor" = 'other'
            AND "stores"."id" = "s3"."id"
            AND CAST("payments"."createdAt" AT TIME ZONE '${timeZone}' AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
          ) AS "otherRevenue"
        `),
            )
            .join('payments', 'payments.storeId', 'stores.id')
            .join('laundromatBusiness', 'laundromatBusiness.id', 'stores.businessId')
            .where('payments.status', 'succeeded')
            .andWhere('stores.id', currentStore.id)
            .whereBetween('payments.createdAt', [finalStartDate, finalEndDate])
            .groupBy('stores.id', 'laundromatBusiness.id');

        const columns = [
            'Store Name',
            'Cash Revenue',
            'Credit Card Revenue',
            'Other Revenue',
            'Total Revenue',
            'Paid with Cash Card',
        ];

        return res.json({
            success: true,
            report: payments,
            columns,
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
        const { currentStore, query } = req;
        const { startDate, endDate, timeZone, status } = query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const orders = await Order.query()
            .select(
                'stores.name as storeName',
                raw(
                    'to_char(AVG("inventoryOrders"."netOrderTotal"), \'l99999D99\') as "inventoryOrderTotals"',
                ),
                raw(
                    'to_char(AVG("serviceOrders"."netOrderTotal"), \'l99999D99\') as "serviceOrderTotals"',
                ),
            )
            .join('stores', 'stores.id', 'orders.storeId')
            .leftJoin('serviceOrders', (table) => {
                table
                    .on('serviceOrders.id', '=', 'orders.orderableId')
                    .onIn('orders.orderableType', ['serviceOrder', 'ServiceOrder'])
                    .andOn('orders.storeId', currentStore.id);
            })
            .leftJoin('inventoryOrders', (table) => {
                table
                    .on('inventoryOrders.id', '=', 'orders.orderableId')
                    .onIn('orders.orderableType', ['inventoryOrder', 'InventoryOrder'])
                    .andOn('orders.storeId', currentStore.id);
            })
            .where('orders.storeId', currentStore.id)
            .whereBetween('inventoryOrders.createdAt', [finalStartDate, finalEndDate])
            .orWhereBetween('serviceOrders.placedAt', [finalStartDate, finalEndDate])
            .modify((queryBuilder) => {
                if (status === 'COMPLETED_AND_ACTIVE') {
                    queryBuilder
                        .andWhere('serviceOrders.status', '<>', 'CANCELLED')
                        .where('serviceOrders.storeId', currentStore.id);
                }
                if (status === 'COMPLETED') {
                    queryBuilder
                        .andWhere('serviceOrders.status', 'COMPLETED')
                        .where('serviceOrders.storeId', currentStore.id);
                }
                if (status === 'ACTIVE') {
                    queryBuilder
                        .andWhere('serviceOrders.status', '<>', 'COMPLETED')
                        .andWhere('serviceOrders.status', '<>', 'CANCELLED')
                        .where('serviceOrders.storeId', currentStore.id);
                }
            })
            .groupBy('stores.name');

        const columns = [
            'Store Name',
            'Average Inventory Order Value',
            'Average Service Order Value',
        ];

        return res.json({
            success: true,
            report: orders,
            columns,
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
        const { currentStore, query } = req;
        const { startDate, endDate, timeZone } = query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const promotionsData = await ServiceOrder.query()
            .select(
                'businessPromotionPrograms.name as promotionCode',
                raw(
                    '"businessPromotionPrograms"."balanceRule"::json->\'explanation\' as "balanceRule"',
                ),
            )
            .count({ promoUses: 'serviceOrders.promotionId' })
            .countDistinct({ customers: 'serviceOrders.storeCustomerId' })
            .sum({ totalPromotionValue: 'serviceOrders.promotionAmount' })
            .join(
                'businessPromotionPrograms',
                'businessPromotionPrograms.id',
                'serviceOrders.promotionId',
            )
            .where('serviceOrders.storeId', currentStore.id)
            .whereNotNull('serviceOrders.promotionId')
            .whereBetween('serviceOrders.createdAt', [finalStartDate, finalEndDate])
            .groupBy('businessPromotionPrograms.name', 'businessPromotionPrograms.balanceRule');

        const columns = [
            'Promotion Code',
            'Promotion Discount Rule',
            'Number of Uses',
            'Number of Customers',
            'Total Promotion Value',
        ];

        return res.json({
            success: true,
            report: promotionsData,
            columns,
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
        const { currentStore, query } = req;
        const { startDate, endDate, timeZone } = query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const newCustomers = await CentsCustomer.query()
            .select(
                raw(
                    'distinct(trim(concat("centsCustomers"."firstName", \' \', "centsCustomers"."lastName"))) as "fullName"',
                ),
                raw(
                    `TO_CHAR("centsCustomers"."createdAt" AT TIME ZONE '${timeZone}', 'MM/DD/YYYY') as "registerDate"`,
                ),
                raw(`
        (
          SELECT to_char("serviceOrders"."netOrderTotal", 'l99999D99')
          FROM "serviceOrders"
          JOIN "storeCustomers" on "storeCustomers"."id" = "serviceOrders"."storeCustomerId"
          WHERE "storeCustomers".id = "serviceOrders"."storeCustomerId"
          AND "storeCustomers"."centsCustomerId" = "centsCustomers"."id"
          AND "serviceOrders"."paymentStatus" = 'PAID'
          LIMIT 1
        ) AS "firstVisitAmount"
      `),
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
            )
            .join('storeCustomers', 'storeCustomers.centsCustomerId', 'centsCustomers.id')
            .join('stores', 'stores.id', 'storeCustomers.storeId')
            .join('serviceOrders', 'serviceOrders.storeCustomerId', 'storeCustomers.id')
            .where('storeCustomers.storeId', currentStore.id)
            .whereBetween('centsCustomers.createdAt', [finalStartDate, finalEndDate]);

        const columns = [
            'Full Name',
            'Registration Date',
            'First Visit Amount',
            'Registration Location',
        ];

        return res.json({
            success: true,
            report: newCustomers,
            columns,
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
        const { currentStore, query } = req;
        const { startDate, endDate, timeZone } = query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

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
                        WHERE "tm1"."checkInTime" IS NOT NULL
                        AND "tm1"."checkOutTime" IS NOT NULL
                        AND "tm1"."teamMemberId" = "teamMembers"."id"
                        AND CAST("tm1"."checkInTime" AT TIME ZONE '${timeZone}' AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
                        AND "stores"."id" = "s1"."id"
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
                    WHERE "serviceOrders"."employeeCode" = "teamMembers"."id"
                    AND "stores"."id" = "s1"."id"
                    AND CAST("serviceOrders"."placedAt" AT TIME ZONE '${timeZone}' AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
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
                    WHERE (
                        "orderActivityLog"."status" = 'READY_FOR_PICKUP'
                        OR "orderActivityLog"."status" = 'HUB_PROCESSING_COMPLETE'
                        OR "orderActivityLog"."status" = 'PROCESSING'
                        OR "orderActivityLog"."status" = 'HUB_PROCESSING_ORDER'
                    )
                    AND "t1"."id" = "teamMembers"."id"
                    AND "stores"."id" = "s1"."id"
                    AND CAST("orderActivityLog"."updatedAt" AT TIME ZONE '${timeZone}' AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
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
                    WHERE "serviceOrderWeights"."step" = 1
                    AND "t1"."id" = "teamMembers"."id"
                    AND "stores"."id" = "s1"."id"
                    AND CAST("serviceOrderWeights"."createdAt" AT TIME ZONE '${timeZone}' AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
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
                    WHERE (
                        "serviceOrderWeights"."status" = 'PROCESSING'
                        OR "serviceOrderWeights"."status" = 'READY_FOR_PICKUP'
                        OR "serviceOrderWeights"."status" = 'COMPLETED'
                        OR "serviceOrderWeights"."status" = 'HUB_PROCESSING_COMPLETE'
                    )
                    AND "t1"."id" = "teamMembers"."id"
                    AND "stores"."id" = "s1"."id"
                    AND CAST("serviceOrderWeights"."createdAt" AT TIME ZONE '${timeZone}' AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
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
            .where('stores.id', currentStore.id)
            .groupBy('stores.id', 'users.firstname', 'users.lastname', 'teamMembers.id');

        const columns = [
            'Full Name',
            'Total Hours Worked',
            'Total Sales Value',
            'Total Orders Processed',
            'Total Pounds Intaken',
            'Total Pounds Processed',
            'Store Name',
        ];

        return res.json({
            success: true,
            report: teamMembers,
            columns,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Determine the proper prefix
 *
 * @param {String} orderType
 */
function determineOrderPrefix(orderType) {
    if (orderType === 'RESIDENTIAL') {
        return 'RDF-';
    }

    if (orderType === 'ONLINE') {
        return 'DWF-';
    }

    return 'WF-';
}

/**
 * Format the tip data for the employee app
 *
 * @param {Object} tip
 * @param {String} timeZone
 */
async function formatTipsData(tip) {
    const orderPrefix = determineOrderPrefix(tip.orderType);

    return {
        orderCode: `${orderPrefix}${tip.orderCode}`,
        location: tip.name,
        netOrderTotal: `$${tip.netOrderTotal}`,
        tipAmount: `$${tip.tipAmount}`,
        intakeEmployee: tip.intakeEmployee,
        washingEmployee: tip.washingEmployee,
        dryingEmployee: tip.dryingEmployee,
        completeProcessingEmployee: tip.completeProcessingEmployee,
        completeEmployee: tip.completeEmployee,
        customerName: tip.customerName,
        paymentDate: tip.paymentDate,
    };
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
        const { currentStore, query } = req;
        const { startDate, endDate, timeZone } = query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const tipsData = await ServiceOrder.query()
            .select(
                'serviceOrders.orderCode',
                'serviceOrders.orderType',
                'stores.name',
                'serviceOrders.netOrderTotal',
                'serviceOrders.tipAmount',
                raw(`
                    (
                        SELECT TRIM(CONCAT("storeCustomers"."firstName", ' ', "storeCustomers"."lastName"))
                        FROM "storeCustomers"
                        WHERE "storeCustomers"."id" = "serviceOrders"."storeCustomerId"
                        LIMIT 1
                    ) AS "customerName"
                `),
                raw(`
                    (
                        SELECT to_char("payments"."createdAt" AT TIME ZONE '${timeZone}', 'MM-DD-YYYY') as "paymentDate"
                        FROM "payments"
                        INNER JOIN "orders" on "orders".id="payments"."orderId"
                        WHERE "orders"."orderableId" = "serviceOrders"."id"
                        AND "orders"."orderableType" = 'ServiceOrder'
                        AND "payments"."status" = 'succeeded'
                        LIMIT 1
                    ) AS "paymentDate"
                `),
                raw(`
                    (
                        SELECT "orderActivityLog"."employeeName"
                        FROM "orderActivityLog"
                        WHERE "orderActivityLog"."status" = 'READY_FOR_PROCESSING'
                        AND "orderActivityLog"."orderId" = "serviceOrders"."id"
                        AND CAST("orderActivityLog"."updatedAt" AT TIME ZONE '${timeZone}' AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
                        LIMIT 1
                    ) AS "intakeEmployee"
                `),
                raw(`
                    (
                        SELECT "orderActivityLog"."employeeName"
                        FROM "orderActivityLog"
                        WHERE ("orderActivityLog"."status" = 'PROCESSING'
                        OR "orderActivityLog"."status" = 'HUB_PROCESSING_ORDER')
                        AND "orderActivityLog"."orderId" = "serviceOrders"."id"
                        AND CAST("orderActivityLog"."updatedAt" AT TIME ZONE '${timeZone}' AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
                        LIMIT 1
                    ) AS "washingEmployee"
                `),
                raw(`
                    (
                        SELECT "orderActivityLog"."employeeName"
                        FROM "orderActivityLog"
                        WHERE ("orderActivityLog"."status" = 'PROCESSING'
                        OR "orderActivityLog"."status" = 'HUB_PROCESSING_ORDER')
                        AND "orderActivityLog"."orderId" = "serviceOrders"."id"
                        AND CAST("orderActivityLog"."updatedAt" AT TIME ZONE '${timeZone}' AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
                        LIMIT 1
                    ) AS "dryingEmployee"
                `),
                raw(`
                    (
                        SELECT "orderActivityLog"."employeeName"
                        FROM "orderActivityLog"
                        WHERE ("orderActivityLog"."status" = 'READY_FOR_PICKUP'
                        OR "orderActivityLog"."status" = 'HUB_PROCESSING_COMPLETE')
                        AND "orderActivityLog"."orderId" = "serviceOrders"."id"
                        AND CAST("orderActivityLog"."updatedAt" AT TIME ZONE '${timeZone}' AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
                        LIMIT 1
                    ) AS "completeProcessingEmployee"
                `),
                raw(`
                    (
                        SELECT "orderActivityLog"."employeeName"
                        FROM "orderActivityLog"
                        WHERE "orderActivityLog"."status" = 'COMPLETED'
                        AND "orderActivityLog"."orderId" = "serviceOrders"."id"
                        AND CAST("orderActivityLog"."updatedAt" AT TIME ZONE '${timeZone}' AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'
                        LIMIT 1
                    ) AS "completeEmployee"
                `),
            )
            .join('stores', 'stores.id', 'serviceOrders.storeId')
            .where('serviceOrders.tipAmount', '>', 0)
            .andWhere('serviceOrders.status', '=', 'COMPLETED')
            .andWhere('serviceOrders.storeId', currentStore.id)
            .whereBetween('serviceOrders.placedAt', [finalStartDate, finalEndDate]);

        let formattedTips = tipsData.map((tip) => formatTipsData(tip));
        formattedTips = await Promise.all(formattedTips);

        const columns = [
            'Order #',
            'Location',
            'Order Total',
            'Tip Value',
            'Intake Employee',
            'Washing Employee',
            'Drying Employee',
            'Complete Processing Employee',
            'Complete/Pickup Employee',
            'Customer',
            'Payment Date',
        ];

        return res.json({
            success: true,
            report: formattedTips,
            columns,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Reformat the time card report data
 *
 * @param {Object} timeCard
 * @param {String} timeZone
 * @returns {Object}
 */
async function formatTimeCardData(timeCard, timeZone) {
    const Store = timeCard.storeName;
    const { fullName, Duration, employeeCode } = timeCard;
    const checkInDate = timeCard.checkInTime
        ? momenttz(timeCard.checkInTime).tz(timeZone).format('MM-DD-YYYY')
        : '-';
    const checkInTime = timeCard.checkInTime
        ? momenttz(timeCard.checkInTime).tz(timeZone).format('hh:mm A z')
        : '-';
    const checkOutDate = timeCard.checkOutTime
        ? momenttz(timeCard.checkOutTime).tz(timeZone).format('MM-DD-YYYY')
        : '-';
    const checkOutTime = timeCard.checkOutTime
        ? momenttz(timeCard.checkOutTime).tz(timeZone).format('hh:mm A z')
        : '-';

    return {
        employeeCode,
        employeeName: fullName,
        duration: Duration,
        checkInDate,
        checkInTime,
        checkOutDate,
        checkOutTime,
        Store,
    };
}

/**
 * Retrieve team member time card data for a given store
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getTeamTimeCardsData(req, res, next) {
    try {
        const { currentStore, query } = req;
        const { startDate, endDate, timeZone, teamMember } = query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        let teamMembers = await TeamMember.query()
            .select(
                'teamMembers.employeeCode as employeeCode',
                raw(
                    'users.firstname || \' \'|| users.lastname as "fullName",(case when ("teamMembersCheckIn"."checkOutTime" is not null)then to_char((EXTRACT(EPOCH from "teamMembersCheckIn"."checkOutTime" - "teamMembersCheckIn"."checkInTime")::text)::interval,\'HH24:MI\') end) as "Duration"',
                ),
                'teamMembersCheckIn.id as checkedIn',
                'teamMembersCheckIn.checkInTime',
                'teamMembersCheckIn.checkOutTime',
                'stores.name as storeName',
            )
            .join('users', 'users.id', 'teamMembers.userId')
            .join('teamMembersCheckIn', 'teamMembersCheckIn.teamMemberId', 'teamMembers.id')
            .join('stores', 'stores.id', 'teamMembersCheckIn.storeId')
            .where('stores.id', currentStore.id)
            .whereIn('teamMembers.id', teamMember)
            .whereBetween('teamMembersCheckIn.checkInTime', [finalStartDate, finalEndDate])
            .orderBy('teamMembers.employeeCode', 'asc')
            .orderBy('teamMembersCheckIn.checkInTime', 'desc');

        teamMembers = teamMembers.map((teamMember) => formatTimeCardData(teamMember, timeZone));

        teamMembers = await Promise.all(teamMembers);

        const columns = [
            'Employee Code',
            'Employee Name',
            'Duration',
            'Check-in Date',
            'Check-in Time',
            'Check-out Date',
            'Check-out Time',
            'Store',
        ];

        return res.json({
            success: true,
            report: teamMembers,
            columns,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Format the individual task data in a human-readable form
 *
 * @param {Object} taskData
 * @param {String} timeZone
 */
async function formatTasksReport(taskData, timeZone) {
    const {
        location,
        createdDate,
        completedDate,
        day,
        shift,
        task,
        TaskDescription,
        Status,
        Employee,
        createdTime,
        completedTime,
        note,
    } = taskData;
    const date = momenttz(taskData.date).tz(timeZone).format('MM/DD/YYYY');
    const mappedDay = weekMapping[day];

    return {
        location,
        createdDate,
        createdTime,
        mappedDay,
        date,
        shift,
        task,
        TaskDescription,
        Status,
        Employee,
        completedDate,
        completedTime,
        note,
    };
}

/**
 * Get a detailed report of all tasks and completion times for a given store
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getTasksReportData(req, res, next) {
    try {
        const { currentStore, query } = req;
        const { startDate, endDate, timeZone } = query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const taskDetails = await Store.knex().raw(`
        select * from(
            with time_series_data AS(
                SELECT date_trunc('day', dd):: date as date, extract(isodow from dd)::text as t_day
                FROM generate_series
                    ( '${finalStartDate}'::timestamp 
                    , '${finalEndDate}'::timestamp
                    , '1 day'::interval) dd
            )
            select distinct (shifts.id), stores.name as Location,
                    to_char(tasks."createdAt" AT TIME ZONE '${timeZone}', 'MM/DD/YYYY') as "createdDate",
                    to_char("taskLogs"."createdAt" AT TIME ZONE '${timeZone}', 'MM/DD/YYYY') as "completedDate",
                    shifts.name as Shift,
                    tasks.name as Task, "tasks".id as task_id, timings.day, time_series_data.date, "taskLogs"."completedAt",
                    ROW_NUMBER() OVER(partition by "tasks".id, timings.id, timings.day, time_series_data.date, shifts.id order by "taskLogs"."completedAt"),
                    tasks.description as "TaskDescription", tasks.id as "taskId",
                    case when "taskLogs"."completedAt" is null then 'incomplete' else 'completed' end as "Status",
                    CONCAT (users."firstname",' ',users."lastname") as "Employee",
                    to_char(tasks."createdAt" AT TIME ZONE '${timeZone}', 'HH12:MI AM') as "createdTime",
                    to_char("taskLogs"."createdAt" AT TIME ZONE '${timeZone}', 'HH12:MI AM') as "completedTime",
                    "taskLogs"."notes" as Note
                    from stores
                    inner join shifts on shifts."storeId" = stores.id
                    inner join timings on timings."shiftId" = shifts.id
                    inner join "taskTimings" on "taskTimings"."timingsId" = "timings".id
                    inner join "tasks" on tasks.id = "taskTimings"."taskId" and tasks."businessId" = ${currentStore.businessId} 
                    inner join time_series_data ON time_series_data.t_day = timings.day
                    left join "taskLogs" on "taskLogs"."taskTimingId" = "taskTimings".id
                    AND "taskLogs".id = (
                                SELECT tl.id
                                FROM "taskLogs" tl 
                                WHERE tl."taskTimingId" = "taskTimings".id AND time_series_data.date = DATE("taskLogs"."completedAt")
                                order by tl."completedAt" desc limit 1)
                    left join "teamMembers" on "teamMembers".id = "taskLogs"."teamMemberId" 
                    left join "users" on "users".id = "teamMembers"."userId" 
                    where (("tasks"."createdAt" BETWEEN '${finalStartDate}' and '${finalEndDate}') or ("taskLogs"."completedAt" BETWEEN '${finalStartDate}' and '${finalEndDate}'))
                    and stores.id = ${currentStore.id}
                   order by "Status" asc, "completedAt" desc
            ) as sub
            where row_number=1
        `);
        let result = taskDetails.rows;
        result = result.map((item) => formatTasksReport(item, timeZone));
        result = await Promise.all(result);

        const columns = [
            'Store',
            'Created Date',
            'Created Time',
            'Day of Week',
            'Date',
            'Shift',
            'Task',
            'Task Description',
            'Status',
            'Employee',
            'Completed Date',
            'Completed Time',
            'Notes',
        ];

        return res.json({
            success: true,
            report: result,
            columns,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get a breakdown of available inventory and quantities for a store
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getInventoryCountReport(req, res, next) {
    try {
        const { currentStore } = req;

        const inventoryItems = await InventoryItem.query()
            .select(
                'inventory.productName',
                raw('to_char("inventoryItems"."price", \'l99999D99\')'),
                'inventoryItems.quantity',
            )
            .join('inventory', 'inventory.id', 'inventoryItems.inventoryId')
            .join('stores', 'stores.id', 'inventoryItems.storeId')
            .where('stores.id', currentStore.id)
            .andWhere('inventoryItems.isFeatured', true);

        const columns = ['Product Name', 'Product Price', 'Current Quantity'];

        return res.json({
            success: true,
            report: inventoryItems,
            columns,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Format the payment data from getOrderSalesAndPaymentMethods() query
 *
 * @param {Object} payment
 * @param {String} timeZone
 */
async function formatSalesAndPaymentData(payment, timeZone) {
    let creditCard = 0;
    let cash = 0;
    let cashCard = 0;
    let other = 0;
    const employeeId =
        payment.orderableType === 'ServiceOrder'
            ? payment.serviceOrderEmployee
            : payment.inventoryOrderEmployee;
    let teamMember = null;
    let orderPrefix = null;

    if (payment.serviceOrderType) {
        orderPrefix = determineOrderPrefix(payment.serviceOrderType);
    }

    if (payment.paymentProcessor === 'stripe') {
        creditCard = `$${payment.appliedAmount}`;
    }

    if (payment.paymentProcessor === 'cash') {
        cash = `$${payment.appliedAmount}`;
    }

    if (
        payment.paymentProcessor === 'cashCard' ||
        payment.paymentProcessor === 'ESD' ||
        payment.paymentProcessor === 'CCI' ||
        payment.paymentProcessor === 'Laundroworks'
    ) {
        cashCard = `$${payment.appliedAmount}`;
    }

    if (payment.paymentProcessor === 'other') {
        other = `$${payment.appliedAmount}`;
    }

    if (employeeId) {
        teamMember = await TeamMember.query().withGraphFetched('user').findById(employeeId);
    }

    return {
        orderCode: payment.serviceOrderCode
            ? `${orderPrefix}${payment.serviceOrderCode}`
            : payment.inventoryOrderCode,
        orderCreatedAt: payment.serviceOrderPlacedAt
            ? momenttz(payment.serviceOrderPlacedAt).tz(timeZone).format('MM-DD-YYYY')
            : momenttz(payment.inventoryOrderCreatedAt).tz(timeZone).format('MM-DD-YYYY'),
        orderableType: payment.orderableType === 'ServiceOrder' ? 'Service Order' : 'Product Order',
        createdAt: momenttz(payment.createdAt).tz(timeZone).format('MM-DD-YYYY'),
        employee: teamMember ? `${teamMember.user.firstname} ${teamMember.user.lastname}` : '--',
        creditCard,
        cash,
        cashCard,
        other,
        paymentMemo: payment.paymentMemo,
        total: `$${payment.appliedAmount}`,
    };
}

/**
 * Get a breakdown of sales per day and the associated payment methods
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getOrderSalesAndPaymentMethods(req, res, next) {
    try {
        const { currentStore, query } = req;
        const { startDate, endDate, timeZone } = query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const paymentData = await Payment.query()
            .select(
                'payments.createdAt',
                'payments.paymentProcessor',
                'payments.paymentMemo',
                'payments.appliedAmount',
                'serviceOrders.orderCode as serviceOrderCode',
                'serviceOrders.orderType as serviceOrderType',
                'inventoryOrders.orderCode as inventoryOrderCode',
                'orders.orderableType',
                'serviceOrders.employeeCode as serviceOrderEmployee',
                'inventoryOrders.employeeId as inventoryOrderEmployee',
                'inventoryOrders.createdAt as inventoryOrderCreatedAt',
                'serviceOrders.placedAt as serviceOrderPlacedAt',
            )
            .join('stores', 'stores.id', 'payments.storeId')
            .join('orders', 'orders.id', 'payments.orderId')
            .leftJoin('serviceOrders', (table) => {
                table
                    .on('serviceOrders.id', '=', 'orders.orderableId')
                    .onIn('orders.orderableType', ['serviceOrder', 'ServiceOrder'])
                    .andOn('orders.storeId', currentStore.id);
            })
            .leftJoin('inventoryOrders', (table) => {
                table
                    .on('inventoryOrders.id', '=', 'orders.orderableId')
                    .onIn('orders.orderableType', ['inventoryOrder', 'InventoryOrder'])
                    .andOn('orders.storeId', currentStore.id);
            })
            .where('stores.id', currentStore.id)
            .andWhere('payments.status', 'succeeded')
            .whereBetween('payments.createdAt', [finalStartDate, finalEndDate])
            .orderBy('payments.createdAt', 'DESC');

        let formattedPayments = paymentData.map((payment) =>
            formatSalesAndPaymentData(payment, timeZone),
        );
        formattedPayments = await Promise.all(formattedPayments);

        const columns = [
            'Order Code',
            'Order Created Date',
            'Order Type',
            'Payment Date',
            'Intake Employee Name',
            'Credit Card',
            'Cash',
            'Cash Card',
            'Total Value',
        ];

        return res.json({
            success: true,
            report: formattedPayments,
            columns,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get an order/sales report that mimics the sales report in the business manager
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getDetailedOrdersReport(req, res, next) {
    try {
        const { currentStore, query } = req;
        const { startDate, endDate, timeZone, status } = query;

        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        let serviceOrders = ServiceOrder.query()
            .withGraphJoined(
                `[
                    orderItems(orderItemDetails).[
                        referenceItems(referenceItemDetails) as refItem.[
                            weightLog(wlDetails), 
                            servicePrice(servPriceDetails) as servPrice
                                .[service(serviceDetails).[serviceCategory(categoryDetails) as categories]],
                            service$(serviceDetails) as serv.[serviceCategory(categoryDetails) as categories],
    
                            inventoryItem(inventoryItemDetails) as inventoryItem
                                .[inventory(inventoryDetails)]
                        ]
                    ],
                    weightLogs(wlDetails),
                    storeCustomer(storeCustomerDetails),
                    order as orderMaster.[delivery(delivery), pickup(pickup), payments(payments)],
                    store(storeDetails),hub(storeDetails),
                    activityLog
                ]`,
            )
            .modifiers({
                reverse: (query) => {
                    query.orderBy('id', 'desc');
                },
                inventoryItemDetails: (query) => {
                    query.select('id');
                },
                inventoryDetails: (query) => {
                    query.select('id', 'productName');
                },
                wlDetails: (query) => {
                    query.select('id', 'totalWeight', 'status').where('step', 1);
                },
                referenceItemDetails: (query) => {
                    query.select('id', 'quantity');
                },
                orderItemDetails: (query) => {
                    query.select('id', 'status');
                },
                servPriceDetails: (query) => {
                    query.select('id');
                },
                serviceDetails: (query) => {
                    query.select('id', 'name');
                },
                categoryDetails: (query) => {
                    query.select('id', 'category');
                },
                storeCustomerDetails: (query) => {
                    query.select('firstName', 'lastName');
                },
                storeDetails: (query) => {
                    query.select('name', 'address', 'businessId', 'id');
                },
                payments: (query) => {
                    query
                        .select(
                            'paymentProcessor',
                            'paymentMemo',
                            'status',
                            'esdReceiptNumber',
                            'createdAt',
                            'updatedAt',
                            'transactionFee',
                        )
                        .where({ status: 'succeeded' })
                        .orderBy('updatedAt', 'desc');
                },
                delivery: (query) => {
                    query.select('totalDeliveryCost', 'type', 'id', 'storeId', 'orderId');
                },
                pickup: (query) => {
                    query.select('totalDeliveryCost', 'type', 'id', 'storeId', 'orderId');
                },
            })
            .orderByRaw('"orderMaster:payments"."createdAt" desc, "serviceOrders".id asc');
        serviceOrders = serviceOrders.where('store.id', currentStore.id);

        let inventoryOrders = InventoryOrder.query()
            .withGraphJoined(
                `[order.[payments(payments), promotionDetails], lineItems, 
        customer(customerDetails).[centsCustomer(customerDetails)], store(storeDetails),
        employee.[user(userDetails)]]`,
            )
            .modifiers({
                storeDetails: (query) => {
                    query.select('id', 'name', 'address', 'city', 'state', 'businessId');
                },
                userDetails: (query) => {
                    query.select('id', 'firstname', 'lastname', 'phone', 'email');
                },
                payments: (query) => {
                    query
                        .select(
                            'id',
                            'orderId',
                            'paymentToken',
                            'status',
                            'totalAmount',
                            'stripeClientSecret',
                            'esdReceiptNumber',
                            'paymentProcessor',
                            'paymentMemo',
                            'createdAt',
                            'updatedAt',
                            'transactionFee',
                        )
                        .where({ status: 'succeeded' })
                        .orderBy('updatedAt', 'desc');
                },
                customerDetails: (query) => {
                    query.select(
                        'id',
                        'firstName',
                        'lastName',
                        'phoneNumber',
                        'email',
                        'languageId',
                    );
                },
            })
            .where({ 'inventoryOrders.paymentStatus': 'PAID' })
            .whereRaw(`"store"."id" =  ${currentStore.id}`)
            .orderByRaw('"order:payments"."createdAt" desc, "inventoryOrders".id asc');

        if (status === 'COMPLETED') {
            serviceOrders = serviceOrders.where(`${ServiceOrder.tableName}.status`, 'COMPLETED');
            inventoryOrders = inventoryOrders.where('inventoryOrders.status', 'COMPLETED');
        } else if (status === 'ACTIVE') {
            serviceOrders = serviceOrders.where((builder) =>
                builder
                    .where(`${ServiceOrder.tableName}.status`, '<>', 'COMPLETED')
                    .andWhere(`${ServiceOrder.tableName}.status`, '<>', 'CANCELLED'),
            );
            inventoryOrders = inventoryOrders.whereNotIn('inventoryOrders.status', [
                'COMPLETED',
                'CANCELLED',
            ]);
        } else if (status === 'COMPLETED_AND_ACTIVE') {
            serviceOrders = serviceOrders.where((builder) =>
                builder
                    .where(`${ServiceOrder.tableName}.status`, 'COMPLETED')
                    .orWhere(`${ServiceOrder.tableName}.status`, '<>', 'CANCELLED'),
            );
            inventoryOrders = inventoryOrders.where('inventoryOrders.status', '<>', 'CANCELLED');
        } else {
            serviceOrders = serviceOrders.andWhere(
                `${ServiceOrder.tableName}.status`,
                '<>',
                'COMPLETED',
            );
            inventoryOrders = inventoryOrders.where('inventoryOrders.status', '<>', 'COMPLETED');
        }

        if (finalStartDate && finalEndDate) {
            serviceOrders = serviceOrders.whereBetween('orderMaster:payments.createdAt', [
                finalStartDate,
                finalEndDate,
            ]);
            inventoryOrders = inventoryOrders.whereBetween('order:payments.createdAt', [
                finalStartDate,
                finalEndDate,
            ]);
        }

        serviceOrders = serviceOrders.andWhere(
            `${ServiceOrder.tableName}.paymentStatus`,
            '=',
            'PAID',
        );
        serviceOrders = await serviceOrders;

        const data = [];
        const empCodes = {};
        serviceOrders.forEach((a) => {
            if (a.employeeCode) {
                empCodes[a.employeeCode] = a.employeeCode;
            }
        });
        const teamMembers = await TeamMember.query()
            .select('teamMembers.id as employeeCode')
            .withGraphJoined('[user(userDetails)]')
            .modifiers({
                userDetails: (query) => {
                    query.select('firstname', 'lastname');
                },
            })
            .whereIn('teamMembers.id', Object.keys(empCodes));
        const teamMembersObj = {};
        teamMembers.forEach((a) => {
            teamMembersObj[a.employeeCode] = `${a.user.firstname} ${a.user.lastname}`;
        });
        serviceOrders.forEach((a) => {
            const location = a.store ? a.store.address : a.hub.address;
            const payment = a.orderMaster.payments;
            let perPoundServices;
            let fixedPriceServices;
            let products;
            let inTakePounds = a.weightLogs[0].totalWeight || 0;
            let paymentType;
            let paymentMemo;
            let pickupFee = 0;
            let deliveryFee = 0;
            let esdReceiptNumber;
            let transactionFee;
            const orderPrefix = determineOrderPrefix(a.orderType);
            const orderCode = `${orderPrefix}${a.orderCode}`;
            const { paymentStatus } = a;
            const inTakeDate = momenttz(payment[0].updatedAt).tz(timeZone).format('MM-DD-YYYY');
            const inTakeTime = momenttz(payment[0].updatedAt).tz(timeZone).format('hh:mm A');
            (a.orderItems || []).forEach((orderItem) => {
                if (orderItem.refItem) {
                    (orderItem.refItem || []).forEach((refItem) => {
                        let service;
                        let inventory;
                        if (refItem.weightLog) {
                            (refItem.weightLog || []).forEach((weightLog) => {
                                inTakePounds += weightLog.totalWeight;
                            });
                        }
                        if (refItem.inventoryItem && refItem.inventoryItem.inventory) {
                            inventory = refItem.inventoryItem.inventory;
                        }
                        if (inventory) {
                            products = products || [];
                            products.push(inventory.productName);
                        }
                        if (refItem.servPrice) {
                            service = refItem.servPrice.service;
                        }
                        if (refItem.serv) {
                            service = refItem.serv;
                        }
                        if (
                            service &&
                            service.categories &&
                            service.categories.category === 'FIXED_PRICE'
                        ) {
                            fixedPriceServices = fixedPriceServices || [];
                            fixedPriceServices.push(service.name);
                        } else if (
                            service &&
                            service.categories &&
                            service.categories.category === 'PER_POUND'
                        ) {
                            perPoundServices = perPoundServices || [];
                            perPoundServices.push(service.name);
                        }
                    });
                }
            });
            fixedPriceServices = fixedPriceServices
                ? [...new Set(fixedPriceServices)].join()
                : null;
            products = products ? [...new Set(products)].join() : null;
            perPoundServices = perPoundServices ? [...new Set(perPoundServices)].join() : null;
            const inTakeEmp = teamMembersObj[a.employeeCode];
            const processingActivityLog = a.activityLog.filter(
                (item) => item.status === 'READY_FOR_PICKUP',
            );
            const processingEmployee =
                processingActivityLog.length > 0 ? processingActivityLog[0].employeeName : null;
            if (a.orderMaster.payments && a.orderMaster.payments.length > 0) {
                paymentType = a.orderMaster.payments.map((payment) =>
                    payment.paymentProcessor === 'stripe' ? 'Cents' : payment.paymentProcessor,
                );
                paymentType = paymentType ? [...new Set(paymentType)].join() : null;

                paymentMemo = a.orderMaster.payments.map((payment) => payment.paymentMemo);

                esdReceiptNumber = a.orderMaster.payments.filter(
                    (item) => item.esdReceiptNumber != null,
                );

                const transactionFees = a.orderMaster.payments.map(
                    (payment) => payment.transactionFee,
                );
                transactionFee = transactionFees.reduce(
                    (previous, currentItem) => previous + currentItem,
                    0,
                );
            }
            if (a.orderMaster.delivery) {
                deliveryFee = a.orderMaster.delivery.totalDeliveryCost;
            }
            if (a.orderMaster.pickup) {
                pickupFee = a.orderMaster.pickup.totalDeliveryCost;
            }
            let custName;
            if (a.storeCustomer) {
                custName = `${a.storeCustomer.firstName} ${a.storeCustomer.lastName}`;
            }

            data.push([
                orderCode,
                location,
                inTakeDate,
                inTakeTime,
                custName,
                a.netOrderTotal,
                perPoundServices,
                fixedPriceServices,
                products,
                inTakeEmp,
                processingEmployee,
                inTakePounds,
                paymentType,
                paymentMemo,
                esdReceiptNumber[0],
                paymentStatus,
                a.status,
                a.creditAmount,
                a.tipAmount,
                pickupFee,
                deliveryFee,
                transactionFee,
            ]);
        });

        inventoryOrders = await inventoryOrders;
        inventoryOrders.forEach((inventoryOrder) => {
            data.push(mapInventoryOrderDetails(inventoryOrder, timeZone));
        });

        const columns = [
            'Order #',
            'Order Location',
            'Order Payment Date',
            'Order Payment Time',
            'Customer Name',
            'Order Value',
            'Per Pound Service',
            'Fixed Price Services',
            'Products',
            'Intake Employee',
            'Employee Completed Processing',
            'Intake Pounds',
            'Payment Type',
            'Payment Memo',
            'Cash Card Receipt',
            'Payment Status',
            'Order Status',
            'Credits',
            'Tip Amount',
            'Pickup Fee',
            'Delivery Fee',
            'Transaction Fee',
        ];

        return res.json({
            success: true,
            report: data,
            columns,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = {
    getRevenueByPaymentMethod,
    getAppliedPromotionsData,
    getNewCustomersData,
    getTeamMemberTotalsReport,
    getTipsPerServiceOrderData,
    getAverageCombinedOrderTotals,
    getTeamTimeCardsData,
    getTasksReportData,
    getInventoryCountReport,
    getOrderSalesAndPaymentMethods,
    getDetailedOrdersReport,
};

const { raw } = require('objection');
const Refund = require('../../../models/refund');
const {
    capitalizeFirstLetterForEachWord,
} = require('../../../utils/formatters/capitalizeFirstLetterForEachWord');
const {
    formatDateRangeForReportTitleWOTimezone,
    getPaymentType,
} = require('../../../utils/reports/reportsUtils');

/**
 * Retrieve the list of refunds for a business using incoming query
 *
 * @param {Object} payload
 */
async function generateRefundsList(payload) {
    try {
        const newPayload = payload;
        const { options, transaction } = newPayload;
        const { status, stores, finalStartDate, finalEndDate, timeZone } = options;
        const storeIds = stores.flatMap((s) => [s.id]);

        const refundsList = status
            ? await Refund.query(transaction)
                  .select(
                      raw(
                          `to_char(refunds."createdAt" AT TIME ZONE "storeSettings"."timeZone", 'MM-DD-YYYY HH12:MI AM') AS "createdDate"`,
                      ),
                      raw(
                          `Coalesce("inventoryOrders"."orderCode", "serviceOrders"."orderCode") AS "orderCode"`,
                      ),
                      'stores.name as locationName',
                      raw(
                          `CAST ("refunds"."refundAmountInCents" / 100.00 as MONEY) as "refundAmount"`,
                      ),
                      'payments.paymentProcessor as paymentMethod',
                      raw(`CONCAT(users.firstname,' ',users.lastname) as "paymentEmployee"`),
                      'refunds.reason',
                      'refunds.status',
                      raw(
                          `to_char(refunds."updatedAt" AT TIME ZONE "storeSettings"."timeZone", 'MM-DD-YYYY HH12:MI AM') AS "updatedAt"`,
                      ),
                      'refunds.refundProvider',
                  )
                  .join('orders', 'orders.id', 'refunds.orderId')
                  .join('payments', 'payments.id', 'refunds.paymentId')
                  .join('storeSettings', 'storeSettings.storeId', 'orders.storeId')
                  .join('stores', 'stores.id', 'orders.storeId')
                  .joinRaw(
                      `left join "inventoryOrders" on "inventoryOrders".id = orders."orderableId" AND orders."orderableType" = 'InventoryOrder'`,
                  )
                  .joinRaw(
                      `left join "serviceOrders" ON "serviceOrders".id = orders."orderableId" AND orders."orderableType" = 'ServiceOrder'`,
                  )
                  .joinRaw(
                      'left join "teamMembers" ON "teamMembers".ID = Coalesce("inventoryOrders"."employeeId", "serviceOrders"."employeeCode")',
                  )
                  .leftJoin('users', 'users.id', 'teamMembers.userId')
                  .whereIn('orders.storeId', storeIds)
                  .andWhereRaw(
                      `CAST("refunds"."createdAt" AT TIME ZONE "storeSettings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'`,
                  )
                  .andWhere((queryBuilder) => {
                      if (status === 'SUCCEED_AND_PENDING') {
                          queryBuilder.whereIn('refunds.status', ['succeeded', 'pending']);
                      }
                      if (status === 'SUCCEED') {
                          queryBuilder.where('refunds.status', 'succeeded');
                      }
                      if (status === 'PENDING') {
                          queryBuilder.where('refunds.status', 'pending');
                      }
                  })
            : [];

        const processedRefundsList = refundsList.map((r) => ({
            ...r,
            paymentEmployee: capitalizeFirstLetterForEachWord(r.paymentEmployee),
            paymentMethod: getPaymentType(r.paymentMethod, true),
            reason: capitalizeFirstLetterForEachWord(
                r.reason?.toLowerCase()?.replace(/_/g, ' ') ?? '',
            ),
            refundProvider: capitalizeFirstLetterForEachWord(r.refundProvider),
            status: capitalizeFirstLetterForEachWord(r.status),
        }));

        const reportTimeFrame = formatDateRangeForReportTitleWOTimezone(
            finalStartDate,
            finalEndDate,
            timeZone,
        );

        newPayload.finalReportData = processedRefundsList;
        newPayload.reportName = `Cents_Refunds_List_${reportTimeFrame}.csv`;
        newPayload.reportHeaders = [
            { id: 'createdDate', title: 'Refund Creation Date' },
            { id: 'orderCode', title: 'Order Code' },
            { id: 'locationName', title: 'Location Name' },
            { id: 'refundAmount', title: 'Refund Amount' },
            { id: 'paymentMethod', title: 'Payment Method' },
            { id: 'paymentEmployee', title: 'Payment Employee' },
            { id: 'reason', title: 'Reason' },
            { id: 'status', title: 'Current Status' },
            { id: 'updatedAt', title: 'Last Updated Date' },
            { id: 'refundProvider', title: 'Refund Provider' },
        ];
        newPayload.reportObjectType = 'object';
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = generateRefundsList;

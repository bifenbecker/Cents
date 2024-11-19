const { isEmpty, get } = require('lodash');
const momenttz = require('moment-timezone');
const InventoryOrder = require('../../../models/inventoryOrders');
const ServiceOrder = require('../../../models/serviceOrders');
const getOrderCodePrefix = require('../../../utils/getOrderCodePrefix');

async function getOrderData(sourceTransaction, trx) {
    const { orderableType, orderableId } = sourceTransaction.metadata;
    const OrderModel = orderableType === 'InventoryOrder' ? InventoryOrder : ServiceOrder;
    const orderDetails = await OrderModel.query(trx).findById(orderableId).withGraphJoined('store');
    if (orderDetails) {
        if (orderableType === 'InventoryOrder') {
            orderDetails.orderType = 'INVENTORY';
        }
        const orderCode = await getOrderCodePrefix(orderDetails);
        return {
            orderCode,
            storeName: orderDetails.store.name,
        };
    }
    return {};
}
/**
 * Retrieve the list of balanceTransaction events for each individual payout
 *
 * Additionally, we add a disclaimer footer as the last row of the sheet
 *
 * @param {Object} payload
 */
async function mapBalanceTransactionsToRowHeaders(payload) {
    try {
        const newPayload = payload;
        const { options, balanceTransactions, transaction: trx } = newPayload;
        const { timeZone } = options;

        const reportData = await Promise.all(
            balanceTransactions.map(async (transaction) => {
                const { source_transfer: sourceTransfer } = transaction.source;
                const row = {};
                if (transaction.type === 'payout') {
                    row.transferAmount = Math.abs(transaction.net / 100);
                    row.createdAt = momenttz(transaction.created * 1000)
                        .tz(timeZone)
                        .format('MM-DD-YYYY');
                    row.arrivedAt = momenttz(transaction.available_on * 1000)
                        .tz(timeZone)
                        .format('MM-DD-YYYY');
                    row.customerPaidAmount = '-';
                    row.toBePaidOut = '-';
                    row.paymentDate = '-';
                }
                if (transaction.type === 'payment') {
                    row.transferAmount = '-';
                    row.createdAt = '-';
                    row.arrivedAt = '-';
                    row.customerPaidAmount = Number(transaction.amount / 100);
                    row.toBePaidOut = Number(transaction.net / 100);
                    row.paymentDate = momenttz(transaction.created * 1000)
                        .tz(timeZone)
                        .format('MM-DD-YYYY');
                }
                if (
                    sourceTransfer &&
                    !isEmpty(sourceTransfer.source_transaction.metadata) &&
                    get(sourceTransfer, 'source_transaction.metadata.orderableId')
                ) {
                    const { orderCode, storeName } = await getOrderData(
                        sourceTransfer.source_transaction,
                        trx,
                    );
                    row.orderCode = orderCode;
                    row.storeName = storeName;
                } else {
                    row.orderCode = '-';
                    row.storeName = '-';
                }
                return row;
            }),
        );

        reportData.push({
            transferAmount:
                '* Expected transfer dates listed above are an estimation, and may vary depending on the financial institutions involved.',
        });

        newPayload.finalReportData = reportData;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = mapBalanceTransactionsToRowHeaders;

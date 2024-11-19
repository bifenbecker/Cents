const formatCurrency = require('../formatCurrency');

/**
 * Format payment array with appropriate details for front-end
 *
 * @param {Array} payments
 */
function mapPayments(payments) {
    return Promise.all(
        payments.map(
            async ({
                createdAt,
                id,
                inventoryOrderCode,
                paymentProcessor,
                paymentTiming,
                serviceOrderCode,
                status,
                store,
                totalAmount,
            }) => ({
                createdAt,
                id,
                paymentProcessor,
                paymentTiming,
                status,
                storeName: store.name,
                totalAmount: await formatCurrency(totalAmount),
                orderCode: inventoryOrderCode || serviceOrderCode,
            }),
        ),
    );
}

module.exports = mapPayments;

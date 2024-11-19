const { UniqueViolationError } = require('objection-db-errors');
const InventoryOrder = require('../../../models/inventoryOrders');
const { getOrderCount, updateOrderCount } = require('../../../utils/ordersCounter');
const TierLookup = require('../../../queryHelpers/tierLookup');
const generateUniqueOrderId = require('../../../utils/generateUniqueOrderId');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

function mapOrderItems(orderItems) {
    return orderItems.map((item) => ({
        lineItemQuantity: item.count,
        lineItemTotalCost: item.price * item.count,
        taxRateId: item.taxRateId,
        lineItemTaxRate: item.lineItemTaxRate,
        lineItemTax: item.taxAmountInCents,
        lineItemName: item.lineItemName,
        lineItemDescription: item.lineItemDescription,
        inventoryItemId: item.priceId,
        lineItemCost: item.perItemPrice,
        lineItemCategory: 'INVENTORY',
    }));
}

async function createInventoryOrder(payload) {
    try {
        const newPayload = payload;
        const {
            customer,
            store: { id: storeId, settings, businessId },
            transaction,
            promotionId,
            serviceOrderItems = [],
            tipAmount,
            orderItemsTotal,
            netOrderTotal,
            balanceDue,
            convenienceFee,
            creditAmount,
            constants,
            paymentStatus,
            taxAmountInCents,
            promotionAmount,
        } = payload;
        const { requiresEmployeeCode } = settings;
        const { employee } = constants;
        const tierLookupQuery = new TierLookup(null, customer.centsCustomerId, businessId);
        const tierId = await tierLookupQuery.tierId();
        // Remove once it is working fine
        const orderCount = await getOrderCount(businessId, transaction);
        const orderCode = 1000 + orderCount + 1;

        const uniqueOrderId = generateUniqueOrderId({
            storeId,
            customerId: customer.id,
        });

        const inventoryOrderDataToInsert = {
            storeId,
            employeeId: requiresEmployeeCode && employee ? employee.id : null,
            orderCode,
            storeCustomerId: customer.storeCustomerId,
            promotionId,
            status: 'CREATED',
            paymentStatus,
            lineItems: mapOrderItems(serviceOrderItems),
            tipAmount,
            salesTaxAmount: taxAmountInCents,
            convenienceFee,
            promotionAmount,
            creditAmount,
            orderTotal: orderItemsTotal,
            netOrderTotal,
            balanceDue,
            tierId,
            uniqueOrderId,
        };

        try {
            const inventoryOrder = await InventoryOrder.query(transaction)
                .insertGraphAndFetch(inventoryOrderDataToInsert)
                .returning('*');
            newPayload.inventoryOrder = inventoryOrder;
        } catch (err) {
            if (
                err instanceof UniqueViolationError &&
                err.constraint === 'inventoryorders_uniqueorderid_unique'
            ) {
                await transaction.rollback();
                const duplicateInventoryOrder = await InventoryOrder.query()
                    .findOne({
                        uniqueOrderId,
                    })
                    .returning('*');
                Object.assign(err, { duplicateInventoryOrder });
                const message = 'Duplicate order recently placed for customer';
                LoggerHandler('error', message, {
                    payload,
                    duplicateInventoryOrder,
                });
            }
            throw err;
        }

        await updateOrderCount(businessId, orderCount, transaction);

        return newPayload;
    } catch (error) {
        throw error.duplicateInventoryOrder ? error : new Error(error);
    }
}

module.exports = exports = createInventoryOrder;

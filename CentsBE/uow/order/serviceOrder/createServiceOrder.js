const { UniqueViolationError } = require('objection-db-errors');

const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');
const ServiceOrder = require('../../../models/serviceOrders');
const { getOrderCount, updateOrderCount } = require('../../../utils/ordersCounter');
const generateUniqueOrderId = require('../../../utils/generateUniqueOrderId');
const TierLookup = require('../../../queryHelpers/tierLookup');

function mapOrderItems(orderItems, status) {
    return orderItems.map((orderItem) => ({
        status,
        price: orderItem.price,
        referenceItems: orderItem.referenceItems,
        taxAmountInCents: orderItem.taxAmountInCents,
        promotionAmountInCents: orderItem.promotionAmountInCents,
    }));
}

async function createServiceOrder(payload) {
    try {
        const newPayload = payload;
        const {
            customer,
            store: { id: storeId },
            transaction,
            notes,
            store: { businessId },
            status,
            paymentTiming,
            promotionId,
            serviceOrderItems = [],
            taxAmountInCents,
            tipAmount,
            pickupDeliveryFee,
            pickupDeliveryTip,
            returnDeliveryFee,
            returnDeliveryTip,
            convenienceFee,
            creditAmount,
            orderItemsTotal,
            netOrderTotal,
            balanceDue,
            tipOption,
            promotionAmount,
            hubId,
            paymentStatus,
            isProcessedAtHub,
            employee,
            convenienceFeeId,
            turnAroundInHours,
            version,
            cents20LdFlag,
        } = payload;
        const tierLookupQuery = new TierLookup(null, customer.centsCustomerId, businessId);
        const tierId = await tierLookupQuery.tierId();
        // Remove once it is working fine
        const orderCount = await getOrderCount(businessId, transaction);
        const orderCode = 1000 + orderCount + 1;

        const uniqueOrderId = generateUniqueOrderId({
            storeId,
            customerId: customer.id,
        });

        const serviceOrderDataToInsert = {
            storeId,
            hubId,
            status,
            notes,
            paymentTiming,
            orderCode,
            storeCustomerId: customer.storeCustomerId,
            promotionId,
            promotionAmount,
            taxAmountInCents,
            orderItems: mapOrderItems(serviceOrderItems),
            tipAmount,
            pickupDeliveryFee,
            pickupDeliveryTip,
            returnDeliveryFee,
            returnDeliveryTip,
            convenienceFee,
            creditAmount,
            orderTotal: orderItemsTotal,
            netOrderTotal,
            balanceDue,
            tipOption,
            isProcessedAtHub,
            paymentStatus,
            employeeCode: employee ? employee.id : null,
            convenienceFeeId,
            tierId,
            uniqueOrderId,
        };
        if (version >= '2.0.0' && cents20LdFlag) {
            serviceOrderDataToInsert.turnAroundInHours = turnAroundInHours.value;
            serviceOrderDataToInsert.turnAroundInHoursSetManually = turnAroundInHours.setManually;
        }

        try {
            const serviceOrder = await ServiceOrder.query(transaction)
                .insertGraphAndFetch(serviceOrderDataToInsert)
                .returning('*');

            newPayload.serviceOrder = serviceOrder;
        } catch (err) {
            if (
                err instanceof UniqueViolationError &&
                err.constraint === 'serviceorders_uniqueorderid_unique'
            ) {
                await transaction.rollback();
                const duplicateServiceOrder = await ServiceOrder.query()
                    .findOne({
                        uniqueOrderId,
                    })
                    .returning('*');
                Object.assign(err, { duplicateServiceOrder });
                const message = 'Duplicate order recently placed for customer';
                LoggerHandler('error', message, {
                    payload,
                    duplicateServiceOrder,
                });
            }
            throw err;
        }

        await updateOrderCount(businessId, orderCount, transaction);

        return newPayload;
    } catch (error) {
        throw error.duplicateServiceOrder ? error : new Error(error);
    }
}

module.exports = exports = createServiceOrder;

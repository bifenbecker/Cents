const ServiceOrderItem = require('../../../../models/serviceOrderItem');
const ServiceOrder = require('../../../../models/serviceOrders');

function mapOrderItems(orderItems, status) {
    return orderItems.map((orderItem) => {
        const item = {
            status,
            price: orderItem.price,
            referenceItems: orderItem.referenceItems,
            taxAmountInCents: orderItem.taxAmountInCents,
            promotionAmountInCents: orderItem.promotionAmountInCents,
        };
        if (orderItem.id) {
            item.id = orderItem.id;
        }
        return item;
    });
}

async function updateServiceOrder(payload) {
    try {
        const newPayload = payload;
        const {
            transaction,
            promotionId,
            taxAmountInCents,
            pickupDeliveryFee,
            pickupDeliveryTip,
            returnDeliveryFee,
            returnDeliveryTip,
            convenienceFee,
            convenienceFeeId,
            creditAmount,
            orderItemsTotal: orderTotal,
            netOrderTotal,
            balanceDue,
            serviceOrderId,
            orderNotes,
            promotionAmount,
            totalItemsToDelete = [],
            employee,
            tipAmount = 0,
            tipOption,
            status,
            recurringDiscountInCents,
        } = payload;

        let { serviceOrderItems = [] } = payload;
        serviceOrderItems = mapOrderItems(serviceOrderItems, status);
        const orderItems = serviceOrderItems.concat(totalItemsToDelete);
        const serviceOrder = await ServiceOrder.query(transaction)
            .findById(serviceOrderId)
            .withGraphFetched('order')
            .patch({
                id: serviceOrderId,
                orderTotal,
                employeeCode: employee ? employee.id : null,
                promotionId,
                netOrderTotal,
                creditAmount,
                paymentStatus: balanceDue > 0 ? 'BALANCE_DUE' : 'PAID',
                balanceDue,
                promotionAmount,
                convenienceFee,
                taxAmountInCents,
                notes: orderNotes,
                pickupDeliveryFee,
                pickupDeliveryTip,
                returnDeliveryFee,
                returnDeliveryTip,
                tipOption,
                tipAmount,
                orderItems,
                convenienceFeeId,
                recurringDiscountInCents,
            })
            .returning('*');

        orderItems.forEach((orderItem) => {
            orderItem.orderId = serviceOrder.id;
        });
        await ServiceOrderItem.query(transaction).upsertGraph(orderItems);
        newPayload.serviceOrder = serviceOrder;
        newPayload.order = serviceOrder.order;
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = updateServiceOrder;

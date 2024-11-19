const currentActiveServiceOrderItems = require('../../../services/orders/queries/currentActiveServiceItems');

async function fetchOrderItems(payload) {
    const { serviceOrder } = payload;
    const orderItems = await currentActiveServiceOrderItems(serviceOrder.id, true);
    orderItems.forEach((item) => {
        item.id = item.orderItemId;
    });
    const perPoundItem = orderItems.find(
        (item) => item.category === 'PER_POUND' && item.lineItemType === 'SERVICE',
    );

    if (perPoundItem) {
        const modifiersPrice = orderItems
            .filter((item) => item.lineItemType === 'MODIFIER')
            .reduce((prev, current) => prev + current.totalPrice, 0);
        perPoundItem.totalPrice += modifiersPrice;
    }
    payload.serviceOrderId = serviceOrder.id;
    payload.serviceOrderItems = orderItems;
    payload.orderItemsTotal = serviceOrder.orderTotal;
    return payload;
}
module.exports = exports = fetchOrderItems;

const { getModifiedOrderItems } = require('../../singleOrder/mapResponseUOW');

async function mapResponse(order) {
    order.orderItems = await getModifiedOrderItems(order);

    return order;
}

module.exports = {
    mapResponse,
};

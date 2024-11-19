const { cancelDoordashDeliveryQueue } = require('../appQueues');
const Model = require('../models')

exports.up = async function (knex) {
    if (process.env.NODE_ENV == 'test') return;

    const query = `
        SELECT od.* FROM "orderDeliveries" od
        INNER JOIN "orders" o on o."id"=od."orderId"
        INNER JOIN "serviceOrders" so on so."id"=o."orderableId" AND o."orderableType"='ServiceOrder'
        WHERE od."status"='INTENT_CREATED' 
        AND od."deliveryProvider"='DOORDASH' AND od."type"='RETURN' AND od."thirdPartyDeliveryId" is not null
        AND so."status" NOT IN ('COMPLETED', 'CANCELED', 'CANCELLED')
    `;

    const { rows } = await knex.raw(query);

    const cancelDoordashDeliveryPromises = rows.map((row) => {
        const payload = {
            orderDeliveryId: row.id,
            orderDelivery: row,
        };
        return cancelDoordashDeliveryQueue.add('cancelDoordashDeliveryQueue', payload);
    });

    return await Promise.all(cancelDoordashDeliveryPromises);
};

exports.down = function (knex) {
    return true;
};
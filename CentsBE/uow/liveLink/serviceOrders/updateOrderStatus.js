const ServiceOrder = require('../../../models/serviceOrders');
const { statuses } = require('../../../constants/constants');

const updateOrderStatus = async (payload) => {
    const { transaction, serviceOrderId } = payload;
    await ServiceOrder.query(transaction)
        .patch({
            status: statuses.READY_FOR_DRIVER_PICKUP,
        })
        .where({
            id: serviceOrderId,
        });
    return payload;
};

module.exports = exports = updateOrderStatus;

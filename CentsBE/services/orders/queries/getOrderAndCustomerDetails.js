const { raw } = require('objection');
const Order = require('../../../models/orders');

async function getServiceOrderAndCustomerDetails(orderId, transaction) {
    const details = Order.query(transaction)
        .select(
            'storeCustomers.phoneNumber as customerPhoneNumber',
            'storeCustomers.centsCustomerId as centsCustomerId',
            raw(
                'concat("storeCustomer"."firstName", \' \', "storeCustomer"."lastName") as "customerName"',
            ),
            'serviceOrders.status as status',
            'serviceOrders.netOrderTotal',
            'serviceOrders.orderTotal',
        )
        .join('serviceOrders', (builder) => {
            builder
                .on('serviceOrders.id', '=', 'orders.orderableId')
                .andOn('orders.orderableType', '=', 'ServiceOrder');
        })
        .where('orders.id', '=', orderId);
    return details;
}

module.exports = exports = getServiceOrderAndCustomerDetails;

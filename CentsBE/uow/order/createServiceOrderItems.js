const ServiceOrderItem = require('../../models/serviceOrderItem');
const CustomerService = require('../../services/residential/Customer');
const NewItemBuilder = require('../../services/orders/builders/serviceOrderItems/newItemBuilder');

function buildItems(newItems, serviceOrderId, status, customerDetails) {
    const items = newItems.map((item) => {
        const { newItem } = new NewItemBuilder(
            item,
            serviceOrderId,
            customerDetails,
            status,
        ).build();
        newItem.customerSelection = true;
        return newItem;
    });
    return items;
}

async function createServiceOrderItems(payload) {
    try {
        const { orderItems, transaction, serviceOrder, status, storeCustomer } = payload;
        const customer = new CustomerService(storeCustomer);
        const newPayload = payload;

        if (orderItems.length === 0) {
            newPayload.serviceOrder.orderItems = [];
            newPayload.itemsTotal = 0;
            return newPayload;
        }

        const serviceOrderItems = await ServiceOrderItem.query(transaction)
            .insertGraphAndFetch(
                buildItems(orderItems, serviceOrder.id, status, {
                    customerName: customer.name,
                    customerPhoneNumber: customer.phone,
                }),
            )
            .returning('*');

        newPayload.serviceOrder.orderItems = serviceOrderItems;
        const itemsTotal = serviceOrderItems.reduce((acc, current) => acc + current.price, 0);
        newPayload.itemsTotal = itemsTotal;
        return newPayload;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = exports = createServiceOrderItems;

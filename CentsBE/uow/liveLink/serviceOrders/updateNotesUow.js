const ServiceOrder = require('../../../models/serviceOrders');
const StoreCustomer = require('../../../models/storeCustomer');

const updateNotes = async (payload) => {
    const { serviceOrderId, orderNotes, customerNotes, transaction } = payload;

    if (orderNotes) {
        await ServiceOrder.query(transaction).findById(serviceOrderId).patch({
            notes: orderNotes,
        });
    }
    if (customerNotes) {
        // update customer notes
        await StoreCustomer.query(transaction)
            .findById(payload.serviceOrder.storeCustomerId)
            .patch({
                notes: customerNotes,
            });
    }
    return payload;
};

module.exports = exports = updateNotes;

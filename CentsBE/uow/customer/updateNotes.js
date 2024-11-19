const StoreCustomer = require('../../models/storeCustomer');

async function updateStoreCustomerNotes(payload) {
    try {
        const {
            storeCustomerId,
            transaction,
            customerNotes,
            isHangDrySelected,
            hangDryInstructions,
        } = payload;

        if (customerNotes || typeof isHangDrySelected !== 'undefined' || hangDryInstructions) {
            await StoreCustomer.query(transaction)
                .patch({
                    notes: customerNotes || null,
                    isHangDrySelected: isHangDrySelected || false,
                    hangDryInstructions: hangDryInstructions || null,
                })
                .findById(storeCustomerId);
        }

        return payload;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = exports = updateStoreCustomerNotes;

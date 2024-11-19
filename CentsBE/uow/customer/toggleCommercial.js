const BusinessCustomer = require('../../models/businessCustomer');

/**
 * updates the businessCustomer
 *
 * @param {*} payload
 */
const toggleCommercial = async (payload) => {
    try {
        const newPayload = payload;

        const {
            transaction,
            businessCustomer,
            isCommercial,
            commercialTierId,
            isInvoicingEnabled,
        } = payload;

        await BusinessCustomer.query(transaction)
            .patch({
                isCommercial,
                commercialTierId,
                isInvoicingEnabled,
            })
            .findById(businessCustomer.id);

        return newPayload;
    } catch (error) {
        throw Error(error);
    }
};

module.exports = exports = toggleCommercial;

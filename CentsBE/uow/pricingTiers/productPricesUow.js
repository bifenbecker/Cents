const { getProductsQuery } = require('../../services/queries/getProductsQuery');

const servicePricesUow = async (payload) => {
    const newPayload = payload;
    const { id, transaction } = newPayload;

    const products = await getProductsQuery(transaction, null, null, id, false);

    newPayload.products = products;
    return newPayload;
};
module.exports = exports = servicePricesUow;

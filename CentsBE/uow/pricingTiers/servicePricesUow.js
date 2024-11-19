const { getServicePrices } = require('../../services/washServices/queries');

const servicePricesUow = async (payload) => {
    const newPayload = payload;
    const { id, transaction } = newPayload;

    const services = await getServicePrices(transaction, null, null, id);

    newPayload.services = services;
    return newPayload;
};
module.exports = exports = servicePricesUow;

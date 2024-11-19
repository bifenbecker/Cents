const onlineOrderServicesQueryHelper = require('../../../helpers/onlineOrderServicesQueryHelper');

async function determineTierId(payload) {
    const { businessCustomer, storeId, zipCode } = payload;
    const newPayload = payload;
    const { queryColumn, queryColumnValue } =
        await onlineOrderServicesQueryHelper.getQueryParamsforServices(
            businessCustomer,
            storeId,
            zipCode,
        );
    const tierId = queryColumn === 'pricingTierId' ? queryColumnValue : null;
    newPayload.tierId = tierId;
    return newPayload;
}

module.exports = { determineTierId };

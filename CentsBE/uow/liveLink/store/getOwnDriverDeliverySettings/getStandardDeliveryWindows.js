const CustomQuery = require('../../../../services/customQuery');

const getStandardDeliveryWindows = async (payload) => {
    const { timeZone, startDate, serviceType, storeId, zipCode } = payload;
    const query = new CustomQuery('daywise-delivery-timings.sql', {
        storeId,
        startTime: Number(startDate) / 1000,
        serviceType,
        zipCode,
        timeZone,
    });
    const rows = await query.execute();
    if (!rows.length) return null;

    return rows;
};

module.exports = getStandardDeliveryWindows;

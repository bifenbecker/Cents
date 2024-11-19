const getOrdersCountPipeline = require('../../../pipeline/employeeApp/orders/getOrdersCountPipeline');

const getOrdersCount = async (req, res, next) => {
    const { currentStore } = req;
    const payload = {
        storeId: currentStore.id,
    };
    const result = await getOrdersCountPipeline(payload);
    res.status(200).json({
        success: true,
        activeOrderCount: result.totalActiveOrdersCount,
    });
};

module.exports = {
    getOrdersCount,
};

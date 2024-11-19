const { getLaundryServicesEmployeeApp } = require('../../../services/washServices/queries');

async function getRegularLaundryPrice(req, res, next) {
    try {
        const store = req.currentStore;
        const { category, orderId, centsCustomerId } = req.query;
        const laundryPrice = await getLaundryServicesEmployeeApp(
            store,
            category,
            orderId,
            centsCustomerId,
        );
        res.status(200).json({
            success: true,
            laundryPrice,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getRegularLaundryPrice;

const getSingleOrderLogic = require('../../../uow/singleOrder/getSingleOrderLogicUOW');
const BusinessSettings = require('../../../models/businessSettings');

async function getSingleOrder(req, res, next) {
    try {
        const { orderId } = req.query;
        if (!Number(orderId)) {
            res.status(422).json({
                error: 'Order id must be number',
            });
            return;
        }
        const { currentStore, apiVersion } = req;
        const businessSettings = await BusinessSettings.query().findOne({
            businessId: currentStore.businessId,
        });
        const cents20LdFlag = !!businessSettings?.dryCleaningEnabled;
        const orderDetails = await getSingleOrderLogic(
            orderId,
            currentStore,
            apiVersion,
            cents20LdFlag,
        );
        res.status(200).json({
            success: true,
            orderDetails,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = {
    getSingleOrder,
};

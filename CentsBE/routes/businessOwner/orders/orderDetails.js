const getSingleOrderLogic = require('../../../uow/singleOrder/getSingleOrderLogicUOW');
const getBusiness = require('../../../utils/getBusiness');
const Settings = require('../../../models/businessSettings');

async function getOrderDetails(req, res, next) {
    try {
        const { id } = req.params;
        const business = await getBusiness(req);
        const settings = await Settings.query().findOne({
            businessId: business.id,
        });
        const orderDetails = await getSingleOrderLogic(id, { businessId: business.id, settings });
        if (orderDetails.orderId) {
            res.status(200).json({
                success: true,
                orderDetails,
                businessSettings: settings,
            });
        } else {
            res.status(404).json({
                error: 'Order not found.',
            });
        }
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getOrderDetails;

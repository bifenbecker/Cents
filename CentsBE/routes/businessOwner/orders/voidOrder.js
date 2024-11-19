const { origins } = require('../../../constants/constants');
const VoidServiceOrder = require('../../../services/orders/serviceOrders/voidServiceOrder');
const getBusiness = require('../../../utils/getBusiness');

async function voidOrder(req, res, next) {
    try {
        const { id } = req.params;
        const business = await getBusiness(req);
        const metaData = {
            origin: origins.BUSINESS_MANAGER,
            notes: req.body.notes,
            businessId: business.id,
        };
        const voidServiceOrder = new VoidServiceOrder(id, metaData);
        await voidServiceOrder.execute();
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = exports = voidOrder;

const ServiceOrder = require('../../../models/serviceOrders');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

async function getOrderFromBarcode(req, res, next) {
    try {
        const barcode = req.query;
        const { currentStore } = req;

        const serviceOrder = await ServiceOrder.query().findOne({
            storeId: currentStore.id,
            uuid: barcode.barcode,
        });

        if (!serviceOrder) {
            const errMsg = 'Order was not found using this barcode.';
            LoggerHandler('error', errMsg, req);
            return res.status(422).json({
                error: errMsg,
            });
        }

        const { id, status } = serviceOrder;

        return res.status(200).json({
            success: true,
            orderId: id,
            orderStatus: status,
        });
    } catch (error) {
        LoggerHandler('error', error, req);
        return next(error);
    }
}

module.exports = exports = getOrderFromBarcode;

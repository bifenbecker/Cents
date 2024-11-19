const NotificationLogs = require('../../../models/orderNotificationLog');

async function getNotificationLogs(req, res, next) {
    try {
        // TODO test
        const orderLogs = await NotificationLogs.query()
            .where('orderId', req.query.orderId)
            .withGraphJoined('language')
            .orderBy('id', 'desc');
        res.status(200).json({
            success: true,
            notificationLogs: orderLogs,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getNotificationLogs;

const { transaction } = require('objection');
const LoggerHandler = require('../../../../LoggerHandler/LoggerHandler');
const Store = require('../../../../models/store');

async function bagTracking(req, res, next) {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(404).json({
                error: 'locationId is required.',
            });
        }
        const store = await Store.query().select('type').findById(id);
        if (store.isHub()) {
            const trx = await transaction.start(Store.knex());
            await Store.query(trx)
                .patch({
                    isBagTrackingEnabled: req.body.isBagTrackingEnabled,
                })
                .where('id', '=', id)
                .orWhere('hubId', '=', id);
            trx.commit();
            return res.status(200).json({
                success: true,
            });
        }
        const errMsg = 'Bag Tracking can only controlled by a Hub';
        LoggerHandler('error', errMsg, req);
        return res.status(422).json({
            error: errMsg,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = bagTracking;

const Device = require('../../../../models/device');
const Batch = require('../../../../models/batch');

const list = async (req, res, next) => {
    try {
        const batchId = req.query.id;
        const limit = req.query.limit || 10;
        const offset = req.query.offset || 0;
        if (!batchId) {
            res.status(404).json({
                error: 'BatchId is required',
            });
            return;
        }
        const isBatch = await Batch.query().findById(batchId);
        if (!isBatch) {
            res.status(404).json({
                error: 'Invalid batchId',
            });
            return;
        }
        const devices = await Device.query()
            .where('batchId', '=', batchId)
            .limit(limit)
            .offset(offset);
        const totalRecords = await Device.query().where('batchId', '=', batchId).count().first();
        res.json({
            devices,
            totalRecords: totalRecords.count,
            limit,
            offset,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = list;

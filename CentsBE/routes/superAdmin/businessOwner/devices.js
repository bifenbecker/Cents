const Device = require('../../../models/device');
const Batch = require('../../../models/batch');

async function checkBatch(businessId, batchId) {
    try {
        const isBatch = await Batch.query().findOne({
            businessId,
            id: batchId,
        });
        if (!isBatch) {
            return false;
        }
        return true;
    } catch (error) {
        throw new Error(error);
    }
}
const list = async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const batchId = req.query.id;
        if (!businessId) {
            res.status(422).json({
                error: 'Business Id is required.',
            });
            return;
        }
        if (!batchId) {
            res.status(422).json({
                error: 'Batch Id is required.',
            });
            return;
        }
        if (!Number(req.query.page)) {
            res.status(422).json({
                error: 'Page should be a number.',
            });
            return;
        }
        const isBatch = await checkBatch(businessId, batchId);
        if (!isBatch) {
            res.status(404).json({
                error: 'Invalid batch Id.',
            });
            return;
        }
        const page = req.query.page ? Number(req.query.page) : 1;
        const offset = page > 1 ? (page - 1) * 10 + 1 : 0;
        const devices = await Device.query()
            .where('batchId', '=', batchId)
            .limit(10)
            .offset(offset);
        const totalCount = await Device.query().count().where('batchId', '=', batchId);
        const totalPages = Math.ceil(totalCount[0].count / 10);
        res.json({
            devices,
            batchId,
            currentPage: page,
            totalPage: totalPages,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports = list;

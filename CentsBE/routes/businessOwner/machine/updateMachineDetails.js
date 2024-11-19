const updateMachineDetailsPipeline = require('../../../pipeline/machines/updateMachineDetailsPipeline');

async function updateMachineDetail(req, res, next) {
    try {
        const payload = {
            ...req.body,
            ...req.params,
        };

        await updateMachineDetailsPipeline(payload);
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateMachineDetail;

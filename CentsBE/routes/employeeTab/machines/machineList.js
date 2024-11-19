const getmachineListPipeline = require('../../../pipeline/machines/getAvailableMachineListPipeline');

async function getavailableMachineList(req, res, next) {
    try {
        const payload = {
            ...req.params,
            ...req.query,
        };
        const machines = await getmachineListPipeline(payload);
        res.status(200).json({
            success: true,
            ...machines,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = exports = getavailableMachineList;

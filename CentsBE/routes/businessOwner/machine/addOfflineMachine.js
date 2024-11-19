const addOfflineMachinePipeline = require('../../../pipeline/machines/addOfflineMachinePipeline');

async function addOfflineMachine(req, res, next) {
    try {
        const payload = req.body;
        const machine = await addOfflineMachinePipeline(payload);

        res.status(200).json({
            success: true,
            machineId: machine.id,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = exports = addOfflineMachine;

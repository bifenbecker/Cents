const addMachinePipeline = require('../../../pipeline/machines/addMachinePipeline');

async function addMachine(req, res, next) {
    try {
        const payload = req.body;
        const machine = await addMachinePipeline(payload);

        res.status(200).json({
            success: true,
            machineId: machine.id,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = exports = addMachine;

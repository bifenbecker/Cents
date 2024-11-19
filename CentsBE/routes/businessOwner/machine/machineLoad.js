const MachineLoad = require('../../../models/machineLoad');

const listMachineLoads = async (req, res, next) => {
    try {
        const modelId = req.query.id;
        if (!modelId || !Number(modelId)) {
            res.status(422).json({
                error: 'Model Id is required.',
            });
            return;
        }
        const machineLoadTypes = await MachineLoad.query()
            .select('machineLoadTypes.name as machineLoad', 'machineModelLoads.id')
            .join('machineModelLoads', 'machineModelLoads.loadId', 'machineLoadTypes.id')
            .where('machineModelLoads.modelId', modelId);

        res.status(200).json({
            loadTypes: machineLoadTypes,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = listMachineLoads;

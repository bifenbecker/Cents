const MachineType = require('../../../models/machineType');

const listMachineModel = async (req, res, next) => {
    try {
        const machineType = req.query.type;
        if (!machineType) {
            res.status(422).json({
                error: 'Machine Type is required.',
            });
            return;
        }
        // TODO test
        const machineModelTypes = await MachineType.query()
            .where('name', '=', machineType)
            .withGraphJoined('models(models)')
            .modifiers({
                models: (builder) => {
                    builder.select('id', 'modelName as modelname', 'capacity', 'manufacturer');
                },
            })
            .first();

        res.status(200).json({
            machineModels: machineModelTypes ? machineModelTypes.models : [],
        });
    } catch (error) {
        next(error);
    }
};

module.exports = listMachineModel;

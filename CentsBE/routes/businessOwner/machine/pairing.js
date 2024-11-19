const pairingPipeline = require('../../../pipeline/machines/pairing');
const unpairPipeline = require('../../../pipeline/machines/unpair');

exports.pairing = async (req, res, next) => {
    try {
        const {
            params: { machineId },
            body,
            constants,
        } = req;
        const machine = await pairingPipeline({
            machineId,
            ...body,
            ...constants,
            id: machineId,
        });
        res.status(200).json({
            success: true,
            machine,
        });
    } catch (error) {
        next(error);
    }
};

exports.unpairing = async (req, res, next) => {
    try {
        const response = await unpairPipeline(req);
        res.json({
            success: true,
            machine: response,
        });
    } catch (error) {
        next(error);
    }
};

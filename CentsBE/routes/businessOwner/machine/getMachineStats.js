const getMachineStatsPipeline = require('../../../pipeline/machines/getMachineStatsPipeline');

const machineStats = async (req, res, next) => {
    try {
        const { origin } = req.constants;
        const payload = {
            ...req.query,
            origin,
        };
        const result = await getMachineStatsPipeline(payload);
        return res.json({
            success: true,
            ...result.stats,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    machineStats,
};

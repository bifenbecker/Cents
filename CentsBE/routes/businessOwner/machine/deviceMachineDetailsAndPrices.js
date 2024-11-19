const deviceMachineDetailsAndPricesPipeline = require('../../../pipeline/machines/getDeviceMachineDetailsAndPricesPipeline');

const getDeviceMachineDetailsAndPrices = async (req, res, next) => {
    try {
        const { deviceId } = req.params;
        const payload = {
            deviceId: Number(deviceId),
        };

        const errorHandler = async (error) => {
            res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        };

        const result = await deviceMachineDetailsAndPricesPipeline(payload, errorHandler);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = getDeviceMachineDetailsAndPrices;

const { origins } = require('../../../constants/constants');
const createMachineByDevicePipeline = require('../../../pipeline/machines/createMachineByDevicePipeline');

async function createMachineByDevice(req, res, next) {
    try {
        const {
            body: { name: machineName },
            params: { deviceId },
            currentUser,
        } = req;
        const payload = {
            deviceId: Number(deviceId),
            machineName,
            currentUser,
            origin: origins.BUSINESS_MANAGER,
        };

        const errorHandler = async (error) => {
            res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        };
        const { machine } = await createMachineByDevicePipeline(payload, errorHandler);

        res.status(201).json({
            success: true,
            machine,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = createMachineByDevice;

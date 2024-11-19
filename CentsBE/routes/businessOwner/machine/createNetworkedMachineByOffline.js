const { origins } = require('../../../constants/constants');
const createNetworkedMachineByOfflinePipeline = require('../../../pipeline/machines/createNetworkedMachineByOfflinePipeline');

async function createNetworkedMachineByOffline(req, res, next) {
    try {
        const {
            body: { name: machineName, deviceId },
            params: { machineId },
            currentUser,
        } = req;
        const payload = {
            deviceId: Number(deviceId),
            machineName,
            machineId: Number(machineId),
            currentUser,
            origin: origins.BUSINESS_MANAGER,
        };

        const errorHandler = async (error) => {
            res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        };
        const { machine: machineCreated } = await createNetworkedMachineByOfflinePipeline(
            payload,
            errorHandler,
        );

        res.status(201).json({
            success: true,
            machine: machineCreated,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = createNetworkedMachineByOffline;

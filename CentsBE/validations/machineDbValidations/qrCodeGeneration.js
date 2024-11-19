const fetchUserStores = require('../../utils/userLocations');
const isMachineAssociated = require('../../lib/authentication').checkMachine;

async function validateRequest(req, res, next) {
    try {
        const user = req.currentUser;
        const { storeId, machineId } = req.query;
        if (!Number(storeId) && !Number(machineId)) {
            res.status(422).json({
                error: 'MachineId or storeId is required',
            });
            return;
        }
        if (machineId) {
            const userId = user.id;
            const isAssociated = await isMachineAssociated(userId, machineId);
            if (!isAssociated) {
                res.status(400).json({
                    error: `You are unauthorized to generate the Qr code for the machine with id ${machineId}`,
                });
                return;
            }
            next();
        } else {
            const allStores = await fetchUserStores(user);
            if (allStores.indexOf(Number(storeId)) !== -1) {
                next();
                return;
            }
            res.status(400).json({
                error: `You are unauthorized to generate Qr codes for the the location with id ${storeId}`,
            });
            return;
        }
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;

const { signResponse } = require('../../../lib/authentication');

async function startMachine(req, res, next) {
    try {
        // eslint-disable-next-line global-require
        const nameSpaces = require('../../../socket/server/namespaces').returnNamespaces;
        // might have to update this import statement.

        const { machineId } = req.body;
        const machineRequest = await signResponse({
            machineId,
            type: 'startCycle',
        });
        nameSpaces('machine').to(machineId).emit('START', machineRequest);
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = startMachine;

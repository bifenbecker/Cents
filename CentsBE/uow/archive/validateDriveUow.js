const { routeStatuses } = require('../../constants/constants');
const Route = require('../../models/route');

async function validateDriveUow(payload, errorHandler) {
    try {
        const { modelId, transaction } = payload;
        const routes = await Route.query(transaction).select('status').where({ driverId: modelId });

        for (const { status } of routes) {
            if (status === routeStatuses.STARTED) {
                errorHandler('Unable to archive - employee is in a route');
                throw new Error('Unable to archive - employee is in a route');
            }
        }
    } catch (err) {
        throw new Error(err);
    }
    return payload;
}

module.exports = validateDriveUow;

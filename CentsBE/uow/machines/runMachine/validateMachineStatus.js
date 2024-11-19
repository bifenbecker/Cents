const { MACHINE_TYPES } = require('../../../constants/constants');
const Machine = require('../../../models/machine');
const { deviceStatuses, serviceTypes } = require('../../../constants/constants');
const { getActiveTurnUow } = require('../getActiveTurnUow');

async function checkInprogressTurnForMachine(payload) {
    const { machineId: id, businessId, transaction, serviceType } = payload;
    const machineDetails = await Machine.query(transaction)
        .findById(id)
        .withGraphJoined(
            '[store, model.[machineType], pairing.[device], machinePricings, machineTurnsStats]',
        )
        .modify((queryBuilder) => {
            if (businessId) {
                queryBuilder.where('store.businessId', businessId);
            }
        });
    if (!machineDetails) {
        throw new Error('Machine not found');
    }
    const { model, machinePricings, pairing } = machineDetails;
    machineDetails.machinePricings = machinePricings.sort((a, b) => b.createdAt - a.createdAt);
    const activePairing = pairing.find((pair) => !pair.deletedAt && pair.device.isPaired);

    const deviceId = activePairing ? activePairing.deviceId : null;
    const activeTurn = await getActiveTurnUow(id, transaction);

    if (serviceType !== serviceTypes.FULL_SERVICE) {
        if (!activePairing) {
            throw new Error('Machine is not paired');
        }
        if (activePairing.device.status === deviceStatuses.OFFLINE) {
            throw new Error('Device is offline');
        }
    }
    if (
        model.machineType.name === MACHINE_TYPES.WASHER &&
        (activeTurn.id || (activePairing && activePairing.device.status === deviceStatuses.IN_USE))
    ) {
        throw new Error('machine is in use');
    }

    const newPayload = {
        businessId: businessId || machineDetails.store?.businessId,
        ...payload,
        machineDetails,
        deviceId,
        activePairing,
    };
    return newPayload;
}

module.exports = {
    checkInprogressTurnForMachine,
};

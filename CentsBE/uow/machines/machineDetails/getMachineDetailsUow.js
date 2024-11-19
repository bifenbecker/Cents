const Machine = require('../../../models/machine');
const MachineQrCode = require('../../../models/machineQrCode');
const {
    getMachinePricePerTurn,
    getMachineNamePrefix,
    getMachineModelDetails,
    getDevice,
} = require('../../../utils/machines/machineUtil');
const { getActiveTurnUow } = require('../getActiveTurnUow');
const { getMachineConfigurationUow } = require('./getMachineConfigurationUow');

async function getMachineDetailsUow(payload) {
    const { id, businessId, transaction } = payload;
    const machineDetails = await Machine.query(transaction)
        .findById(id)
        .withGraphJoined(
            '[store, model.[machineType], pairing.[device], machinePricings, machineTurnsStats]',
        )
        .where('store.businessId', businessId)
        .first();
    const qrCode = await MachineQrCode.query()
        .where('machineId', id)
        .andWhere('deletedAt', null)
        .select('id', 'hash');

    if (!machineDetails) {
        throw new Error('Machine not found');
    }
    const device = getDevice(machineDetails);
    const machineModel = getMachineModelDetails(machineDetails);
    const activeTurn = await getActiveTurnUow(id, transaction);

    const formattedRes = {
        id: machineDetails.id,
        store: {
            id: machineDetails.store.id,
            address: machineDetails.store.address,
            name: machineDetails.store.name,
        },
        name: machineDetails.name,
        prefix: getMachineNamePrefix(machineDetails.model),
        serialNumber: machineDetails.serialNumber,
        pricePerTurnInCents: getMachinePricePerTurn(machineDetails),
        turnTimeInMinutes: machineDetails.turnTimeInMinutes,
        model: machineModel,
        avgTurnsPerDay: machineDetails.machineTurnsStats
            ? machineDetails.machineTurnsStats.avgTurnsPerDay
            : null,
        avgSelfServeRevenuePerDay: machineDetails.machineTurnsStats
            ? machineDetails.machineTurnsStats.avgSelfServeRevenuePerDay
            : null,
        device,
        activeTurn,
        qrCode,
    };

    const result = await getMachineConfigurationUow({
        machineId: id,
        transaction,
    });
    formattedRes.totalCoinsUsed = result.machineConfiguration
        ? result.machineConfiguration.CoinTotal
        : 0;

    return formattedRes;
}

module.exports = {
    getMachineDetailsUow,
};

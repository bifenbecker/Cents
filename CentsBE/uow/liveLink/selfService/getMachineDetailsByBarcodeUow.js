const Machine = require('../../../models/machine');
const {
    getMachinePricePerTurn,
    getMachineNamePrefix,
    getMachineModelDetails,
    getDevice,
    isMachineAvailable,
    getLaundromatBusiness,
} = require('../../../utils/machines/machineUtil');
const { getActiveTurnUow } = require('../../machines/getActiveTurnUow');

async function getMachineDetailsByBarcodeUow(payload) {
    const { barcode, transaction } = payload;
    const machineDetails = await Machine.query(transaction)
        .findOne({
            serialNumber: barcode,
        })
        .withGraphJoined(
            '[store.[laundromatBusiness], model.[machineType], pairing.[device], machinePricings]',
        );

    if (!machineDetails) {
        throw new Error('Machine not found');
    }
    const device = getDevice(machineDetails);
    const machineModel = getMachineModelDetails(machineDetails);
    const activeTurn = await getActiveTurnUow(machineDetails.id, transaction);
    const business = getLaundromatBusiness(machineDetails);
    const isAvailable = isMachineAvailable(device, activeTurn);
    const formattedRes = {
        id: machineDetails.id,
        store: {
            id: machineDetails.store.id,
            address: machineDetails.store.address,
            name: machineDetails.store.name,
        },
        business,
        name: machineDetails.name,
        prefix: getMachineNamePrefix(machineDetails.model),
        serialNumber: machineDetails.serialNumber,
        pricePerTurnInCents: getMachinePricePerTurn(machineDetails),
        turnTimeInMinutes: machineDetails.turnTimeInMinutes,
        model: machineModel,
        device,
        activeTurn,
        isAvailable,
    };
    return formattedRes;
}

module.exports = {
    getMachineDetailsByBarcodeUow,
};

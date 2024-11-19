const Pairing = require('../../../models/pairing');
const Device = require('../../../models/device');

/**
 * pairs machine with device
 * @param {{transaction: any, currentUser, device: Object, origin: String, machine: Object}} payload
 * @returns object
 */
async function pairMachineAndDeviceUow(payload) {
    const { transaction, device, origin, machine, currentUser } = payload;
    const pairingDto = {
        origin,
        deviceId: device.id,
        machineId: machine.id,
        pairedByUserId: currentUser.id,
    };

    const pairing = await Pairing.query(transaction).insertAndFetch(pairingDto);
    await Device.query(transaction).patch({
        isPaired: true,
    });

    // TODO: add event in future to send the created machine data to the device

    return {
        ...payload,
        pairing,
    };
}

module.exports = pairMachineAndDeviceUow;

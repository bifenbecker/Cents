const { turnStatuses, deviceStatuses } = require('../../constants/constants');
const Device = require('../../models/device');
const Machine = require('../../models/machine');
const Pairing = require('../../models/pairing');
const Turns = require('../../models/turns');
const { mapMachineData } = require('../../utils/machines/machineUtil');

/**
 *
 * @param {*} payload
 * get paired data from machineid
 * get device data from paired response
 * check device status
 * **if in use dnt unpair
 * update unpair data to pairing, device table
 * @returns
 */

async function unpairMachine(payload) {
    try {
        const {
            params: { machineId },
            body: { userId, origin },
            transaction,
        } = payload;

        const pairingUpdateObject = {
            deletedAt: new Date().toISOString(),
            unPairedByUserId: userId,
            origin,
        };

        const deviceUpdateObject = {
            isPaired: false,
            isActive: false,
        };

        const pairedDevice = await Pairing.query(transaction)
            .where('machineId', '=', machineId)
            .andWhere('deletedAt', null)
            .first();

        const deviceData = await Device.query(transaction).findById(pairedDevice.deviceId);
        if (deviceData.status === deviceStatuses.OFFLINE) {
            throw new Error('Device is offline.');
        }
        await pairedDevice.$query(transaction).patch(pairingUpdateObject).returning('*');
        await deviceData.$query(transaction).patch(deviceUpdateObject).returning('*');
        const machineData = await Machine.query(transaction)
            .findById(machineId)
            .withGraphJoined(
                '[store, model.machineType,turns,machinePricings(machinePricings), machineTurnsStats]',
            )
            .modifiers({
                machinePricings: (query) => {
                    query.orderBy('id', 'DESC').first();
                },
            });

        // update turn status to complete if there are turns created for this machine
        await Turns.query(transaction)
            .knex()
            .raw(
                `update "turns" set "enabledAt" = now(), "startedAt" = now(), "completedAt" = now(), "status" = 'COMPLETED', "origin" = '${origin}', "userId" = ${
                    userId || null
                }, "updatedAt" = now() where "machineId" = ${machineId} and not "status" = '${
                    turnStatuses.COMPLETED
                }' returning "turns".*`,
            );
        return mapMachineData(machineData);
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = unpairMachine;

const _ = require('lodash');
const { raw } = require('objection');
const MachineModel = require('../../models/machineModel');
const Machine = require('../../models/machine');
const Device = require('../../models/device');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const { MACHINE_PRICING_TYPES } = require('../../constants/constants');

async function getMachineModels(payload) {
    const models = _.uniq(_.map(payload.machinesData, (row) => row.machineModel.toLowerCase()));
    const machineModels = await MachineModel.query(payload.transaction)
        .select()
        .withGraphFetched('machineType')
        .whereIn(
            raw('lower("modelName")'),
            models.map((model) => model.toLowerCase()),
        );
    if (models.length !== machineModels.length) {
        const notFoundModels = _.filter(
            models,
            (model) =>
                _.findIndex(
                    machineModels,
                    (machineModel) => machineModel.modelName.toLowerCase() === model.toLowerCase(),
                ) === -1,
        );
        throw new Error(`Models ${notFoundModels} not found `);
    }
    return machineModels;
}

async function getDevices(payload) {
    const devices = _.uniq(_.map(payload.machinesData, 'device'));
    const machineDevices = await Device.query(payload.transaction)
        .select()
        .innerJoinRelated('batch')
        .whereIn(
            raw('lower("name")'),
            devices.map((device) => device.toLowerCase()),
        )
        .where('batch.storeId', payload.storeId)
        .where('isPaired', false);
    if (devices.length !== machineDevices.length) {
        const notFoundDevices = _.filter(
            devices,
            (device) =>
                _.findIndex(
                    machineDevices,
                    (machineDevice) => machineDevice.name.toLowerCase() === device.toLowerCase(),
                ) === -1,
        );
        throw new Error(`Devices ${notFoundDevices.join('\n')} not available or paired already`);
    }
    return machineDevices;
}

async function getMachines(payload, models, devices) {
    const errors = [];
    const mappedData = await payload.machinesData.map(async (machine, index) => {
        let mappedData = {};
        const machineData = await Machine.query(payload.transaction)
            .withGraphFetched('[pairing(notDeleted),machinePricings]')
            .modifiers({
                notDeleted: (query) => query.where({ deletedAt: null }),
            })
            .where({
                name: machine.name,
                storeId: payload.storeId,
                modelId: _.find(
                    models,
                    (ele) => ele.modelName.toLowerCase() === machine.machineModel.toLowerCase(),
                ).id,
            })
            .first();
        const machineModel = _.find(
            models,
            (model) => model.modelName.toLowerCase() === machine.machineModel.toLowerCase(),
        );
        const device = {
            id: _.find(devices, (ele) => ele.name.toLowerCase() === machine.device.toLowerCase())
                .id,
            isPaired: true,
            isActive: true,
        };
        if (machineData) {
            if (machineData.pairing && machineData.pairing.length) {
                errors.push({
                    error: `${machineData.name} was already paired`,
                    row: index + 2,
                });
                return false;
            }
            mappedData = {
                id: machineData.id,
                isActive: true,
                pairing: {
                    deviceId: _.find(
                        devices,
                        (ele) => ele.name.toLowerCase() === machine.device.toLowerCase(),
                    ).id,
                    machineId: machineData.id,
                    deletedAt: null,
                    origin: payload.origin,
                    pairedByUserId: payload.userId,
                    device,
                },
            };
            if (machineModel.machineType.name === 'DRYER') {
                mappedData.turnTimeInMinutes =
                    machine.minsPerDryer || machineData.turnTimeInMinutes;
            } else {
                mappedData.machinePricings = [
                    {
                        id: machineData.machinePricings[0].id,
                        price: machine.pricePerTurn
                            ? machine.pricePerTurn * 100
                            : machineData.machinePricings[0].price,
                    },
                ];
            }
        } else {
            mappedData = {
                name: machine.name,
                storeId: payload.storeId,
                modelId: machineModel.id,
                isActive: true,
                origin: payload.origin,
                userId: payload.userId,
                pairing: {
                    deviceId: _.find(
                        devices,
                        (ele) => ele.name.toLowerCase() === machine.device.toLowerCase(),
                    ).id,
                    deletedAt: null,
                    origin: payload.origin,
                    pairedByUserId: payload.userId,
                    device,
                },
            };
            if (machineModel.machineType.name === 'DRYER') {
                if (!machine.minsPerDryer) {
                    errors.push({
                        error: `Dryer ${machine.name} has invalid 'minsPerDryer' column`,
                        row: index + 2,
                    });
                    return false;
                }
                mappedData.turnTimeInMinutes = machine.minsPerDryer;
                mappedData.machinePricings = [
                    {
                        price: 25,
                        type: MACHINE_PRICING_TYPES.BASE_VEND,
                    },
                ];
            } else {
                if (!machine.pricePerTurn) {
                    errors.push({
                        error: `Washer ${machine.name} has invalid 'pricePerTurn' column`,
                        row: index + 2,
                    });
                    return false;
                }
                mappedData.machinePricings = [
                    {
                        price: machine.pricePerTurn * 100,
                        type: MACHINE_PRICING_TYPES.BASE_VEND,
                    },
                ];
            }
        }
        return mappedData;
    });
    const machines = await Promise.all(mappedData);
    return {
        errors,
        machines,
    };
}

async function mapMachinesData(payload) {
    try {
        const machineModels = await getMachineModels(payload);
        const devices = await getDevices(payload);
        const { machines, errors } = await getMachines(payload, machineModels, devices);
        return {
            transaction: payload.transaction,
            mappedMachinesData: machines,
            errors,
            storeId: payload.storeId,
            userId: payload.userId,
            machineData: payload.machineData,
        };
    } catch (err) {
        LoggerHandler('error', `Failure in mapMachinesData UOW:\n\n${err}`, payload);
        throw err;
    }
}

module.exports = mapMachinesData;

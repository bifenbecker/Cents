require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const {
    getMachineNamePrefix,
    getMachineType,
    getDevice,
    getMachinePricePerTurn,
    getMachineModelDetails,
    getMachineTurnCode,
    mapMachineData,
    isMachineAvailable,
    getLaundromatBusiness,
} = require('../../../../utils/machines/machineUtil');
const { deviceStatuses } = require('../../../../constants/constants');

describe('test machineUtil', () => {
    describe('test getMachineNamePrefix', () => {
        it('should return machine name prefix', () => {
            const machineModel = {
                machineType: {
                    name: 'washer',
                },
            };
            expect(getMachineNamePrefix(machineModel)).to.equal('W');
        });
    });

    describe('test getMachineType', () => {
        it('should return machine type', () => {
            const machineModel = {
                machineType: {
                    name: 'DRYER',
                },
            };
            expect(getMachineType(machineModel)).to.equal(machineModel.machineType.name);
        });
    });

    describe('test getDevice', () => {
        it('should return device', () => {
            const machine = {
                pairing: [
                    {
                        deletedAt: new Date(),
                        device: {
                            id: 1,
                            name: 'SG747',
                            isPaired: false,
                            status: 'OFFLINE',
                        },
                    },
                    {
                        deletedAt: null,
                        device: {
                            id: 2,
                            name: 'MD111',
                            isPaired: true,
                            status: 'OFFLINE',
                        },
                    },
                ],
            };
            expect(getDevice(machine)).to.include(machine.pairing[1].device);
        });

        it('should return empty object if pairing is not active', () => {
            const machine = {
                pairing: [
                    {
                        deletedAt: new Date(),
                        device: {
                            id: 1,
                            name: 'SG747',
                            isPaired: false,
                            status: 'OFFLINE',
                        },
                    },
                ],
            };
            expect(getDevice(machine)).to.be.an('object').and.to.be.empty;
        });

        it('should return empty object if pairing is not provided', () => {
            const machine = {};
            expect(getDevice(machine)).to.be.an('object').and.to.be.empty;
        });
    });

    describe('test getMachinePricePerTurn', () => {
        it('should return price per turn', () => {
            const machine = {
                machinePricings: [
                    {
                        price: 12,
                    },
                ],
            };

            expect(getMachinePricePerTurn(machine)).to.equal(machine.machinePricings[0].price);
        });

        it('should return empty price per turn', () => {
            const machine = {
                machinePricings: [],
            };
            expect(getMachinePricePerTurn(machine)).to.be.null;
        });
    });

    describe('test getMachineModelDetails', () => {
        it('should return model details', () => {
            const machine = {
                model: {
                    capacity: '15LB',
                    modelName: 'T900',
                    manufacturer: 'LG',
                    machineType: {
                        name: 'WASHER',
                    },
                },
            };

            expect(getMachineModelDetails(machine)).to.include({
                capacity: machine.model.capacity,
                modelName: machine.model.modelName,
                manufacturer: machine.model.manufacturer,
                type: machine.model.machineType.name,
            });
        });
    });

    describe('test getMachineTurnCode', () => {
        it('should return machine turn code', () => {
            const machineTurnsCount = 200;
            expect(getMachineTurnCode(machineTurnsCount)).to.equal(1201);
        });
    });

    describe('test mapMachineData', () => {
        let machine;

        beforeEach(() => {
            machine = {
                id: 1,
                name: 'A100',
                serialNumber: '12345354',
                turnTimeInMinutes: 2,
                store: {
                    id: 1,
                    address: 'NY, Sample street, 1',
                    name: 'Great store',
                },
                model: {
                    machineType: {
                        name: 'WASHER',
                        capacity: 10,
                        modelName: 'PT',
                        manufacturer: 'PTech',
                    },
                },
                machineTurnsStats: {
                    avgTurnsPerDay: 11,
                    avgSelfServeRevenuePerDay: 110,
                },
                machinePricings: [
                    {
                        price: 12,
                    },
                ],
            };
        });

        it('should map machine data', () => {
            const result = mapMachineData(machine);

            expect(result).to.deep.include({
                id: machine.id,
                store: {
                    id: machine.store.id,
                    address: machine.store.address,
                    name: machine.store.name,
                },
                name: machine.name,
                activeTurns: {},
                device: {},
                serialNumber: machine.serialNumber,
                prefix: 'W',
                model: {
                    capacity: machine.model.capacity,
                    modelName: machine.model.modelName,
                    manufacturer: machine.model.manufacturer,
                    type: machine.model.machineType.name,
                },
                avgTurnsPerDay: machine.machineTurnsStats.avgTurnsPerDay,
                avgSelfServeRevenuePerDay: machine.machineTurnsStats.avgSelfServeRevenuePerDay,
                pricePerTurnInCents: machine.machinePricings[0].price,
                turnTimeInMinutes: machine.turnTimeInMinutes,
            });
        });

        it('should map machine data with default values', () => {
            delete machine.serialNumber;
            delete machine.machineTurnsStats;
            delete machine.machinePricings;

            const result = mapMachineData(machine);

            expect(result).to.deep.include({
                id: machine.id,
                store: {
                    id: machine.store.id,
                    address: machine.store.address,
                    name: machine.store.name,
                },
                name: machine.name,
                activeTurns: {},
                device: {},
                serialNumber: null,
                prefix: 'W',
                model: {
                    capacity: machine.model.capacity,
                    modelName: machine.model.modelName,
                    manufacturer: machine.model.manufacturer,
                    type: machine.model.machineType.name,
                },
                avgTurnsPerDay: null,
                avgSelfServeRevenuePerDay: null,
                pricePerTurnInCents: 0,
                turnTimeInMinutes: machine.turnTimeInMinutes,
            });
        });
    });

    describe('test isMachineAvailable', () => {
        it('should return true for online device without active turn', () => {
            const device = {
                    status: deviceStatuses.ONLINE,
                },
                activeTurn = {};

            expect(isMachineAvailable(device, activeTurn)).to.be.true;
        });

        it('should return false for offline device', () => {
            const device = {
                    status: deviceStatuses.OFFLINE,
                },
                activeTurn = {};

            expect(isMachineAvailable(device, activeTurn)).to.be.false;
        });

        it('should return false for existing active turn', () => {
            const device = {
                    status: deviceStatuses.ONLINE,
                },
                activeTurn = { id: 1 };

            expect(isMachineAvailable(device, activeTurn)).to.be.false;
        });
    });

    describe('test getLaundromatBusiness', () => {
        it('should return business from machine', () => {
            const machine = {
                store: {
                    laundromatBusiness: {
                        id: 1,
                    },
                },
            };

            expect(getLaundromatBusiness(machine)).to.deep.equal({
                id: machine.store.laundromatBusiness.id,
            });
        });
    });
});

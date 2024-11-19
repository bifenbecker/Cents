require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const {
    checkInprogressTurnForMachine,
} = require('../../../../../uow/machines/runMachine/validateMachineStatus');
const factory = require('../../../../factories');
const {
    serviceTypes,
    deviceStatuses,
    turnStatuses,
} = require('../../../../../constants/constants');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');

const createMachinePairing = async (
    machineId,
    deviceStatus = deviceStatuses.ONLINE,
    pairingOptions = {},
) => {
    const device = await factory.create(FACTORIES_NAMES.device, {
        status: deviceStatus,
        isPaired: true,
    });
    await factory.create(FACTORIES_NAMES.pairing, {
        machineId: machineId,
        deviceId: device.id,
        ...pairingOptions,
    });

    return { deviceId: device.id };
};

const createMachinePairingAndPricing = async (machineId, prices = []) => {
    for (const price of prices) {
        await factory.create(FACTORIES_NAMES.machinePricing, {
            machineId: machineId,
            price,
        });
    }

    return await createMachinePairing(machineId);
};

describe('test validateMachineStatus', () => {
    describe('test checkInprogressTurnForMachine', () => {
        let business, machine;

        beforeEach(async () => {
            business = await factory.create(FACTORIES_NAMES.laundromatBusiness);

            const store = await factory.create(FACTORIES_NAMES.store, {
                    businessId: business.id,
                }),
                machineType = await factory.create(FACTORIES_NAMES.machineType, {
                    name: 'WASHER',
                }),
                machineModel = await factory.create(FACTORIES_NAMES.machineModel, {
                    typeId: machineType.id,
                });

            machine = await factory.create(FACTORIES_NAMES.machine, {
                storeId: store.id,
                modelId: machineModel.id,
            });
        });

        it('should reject if machine was not found', async () => {
            const payload = {
                machineId: -1,
                businessId: business.id,
                serviceType: serviceTypes.TECHNICAL_SERVICE,
            };

            await expect(checkInprogressTurnForMachine(payload)).to.be.rejectedWith(
                'Machine not found',
            );
        });

        it('should reject if machine is not paired for customer service', async () => {
            const payload = {
                machineId: machine.id,
                businessId: business.id,
                serviceType: serviceTypes.CUSTOMER_SERVICE,
            };

            await expect(checkInprogressTurnForMachine(payload)).to.be.rejectedWith(
                'Machine is not paired',
            );
        });

        it('should reject if machine pairing was deleted', async () => {
            await createMachinePairing(machine.id, deviceStatuses.ONLINE, {
                deletedAt: new Date(),
            });

            const payload = {
                machineId: machine.id,
                businessId: business.id,
                serviceType: serviceTypes.CUSTOMER_SERVICE,
            };

            await expect(checkInprogressTurnForMachine(payload)).to.be.rejectedWith(
                'Machine is not paired',
            );
        });

        it('should reject if device is offline for customer service', async () => {
            await createMachinePairing(machine.id, deviceStatuses.OFFLINE);

            const payload = {
                machineId: machine.id,
                businessId: business.id,
                serviceType: serviceTypes.CUSTOMER_SERVICE,
            };

            await expect(checkInprogressTurnForMachine(payload)).to.be.rejectedWith(
                'Device is offline',
            );
        });

        it('should reject if device is in use', async () => {
            await createMachinePairing(machine.id, deviceStatuses.IN_USE);

            const payload = {
                machineId: machine.id,
                businessId: business.id,
                serviceType: serviceTypes.FULL_SERVICE,
            };

            await expect(checkInprogressTurnForMachine(payload)).to.be.rejectedWith(
                'machine is in use',
            );
        });

        it('should reject if active turn exists', async () => {
            await factory.create(FACTORIES_NAMES.turn, {
                machineId: machine.id,
                status: turnStatuses.STARTED,
            });

            const payload = {
                machineId: machine.id,
                businessId: business.id,
                serviceType: serviceTypes.FULL_SERVICE,
            };

            await expect(checkInprogressTurnForMachine(payload)).to.be.rejectedWith(
                'machine is in use',
            );
        });

        it('should return payload for existing pairing', async () => {
            const prices = [10, 11];
            const { deviceId } = await createMachinePairingAndPricing(machine.id, prices);

            const payload = {
                machineId: machine.id,
                businessId: business.id,
                serviceType: serviceTypes.CUSTOMER_SERVICE,
            };

            const result = await checkInprogressTurnForMachine(payload);

            expect(result.machineDetails).to.be.an('object');
            expect(result.machineDetails.machinePricings).to.be.an('array').and.to.have.lengthOf(2);

            // check only members included, since prices can be created in the DB in any order
            expect(result.machineDetails.machinePricings.map(({ price }) => price)).to.have.members(
                prices,
            );
            expect(result.deviceId).to.equal(deviceId);
            expect(result.activePairing.deviceId).to.equal(deviceId);
        });

        it('should return payload for a full service', async () => {
            const payload = {
                machineId: machine.id,
                businessId: business.id,
                serviceType: serviceTypes.FULL_SERVICE,
            };

            const result = await checkInprogressTurnForMachine(payload);

            expect(result.machineDetails.machinePricings).to.be.an('array').that.is.empty;
            expect(result.deviceId).to.be.null;
            expect(result.activePairing).to.not.exist;
        });
    });
});

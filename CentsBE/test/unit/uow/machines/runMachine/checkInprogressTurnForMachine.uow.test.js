require('../../../../testHelper');
const { expect, chai } = require('../../../../support/chaiHelper');
chai.use(require('chai-as-promised'));
const faker = require('faker');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { checkInprogressTurnForMachine } = require('../../../../../uow/machines/runMachine/validateMachineStatus');
const { serviceTypes, deviceStatuses, MACHINE_TYPES } = require('../../../../../constants/constants');
const Machine = require('../../../../../models/machine');

describe('test checkInprogressTurnForMachine uow function', () => {
    let business;
    let store;
    let centsCustomer;
    let machine;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        machine = await factory.create(FACTORIES_NAMES.machine, {
            storeId: store.id,
        });
    });

    describe('when a machine does not exist', () => {
        it('should reject if machine does not exist', async () => {
            const payloadMock = {
                machineId: 237362,
                businessId: business.id,
                serviceType: serviceTypes.FULL_SERVICE,
            };

            await expect(checkInprogressTurnForMachine(payloadMock)).to.be.rejectedWith('Machine not found');
        });
    });

    describe('when a machine exist', () => {
        describe('when serviceType is not FULL_SERVICE', () => {
            it('should reject if machine is not paired', async () => {
                const payloadMock = {
                    machineId: machine.id,
                    businessId: business.id,
                    serviceType: serviceTypes.SELF_SERVICE,
                };

                await expect(checkInprogressTurnForMachine(payloadMock)).to.be.rejectedWith('Machine is not paired');
            });

            it('should reject if device is offline', async () => {
                const payloadMock = {
                    machineId: machine.id,
                    businessId: business.id,
                    serviceType: serviceTypes.SELF_SERVICE,
                };
                const device = await factory.create('device', {
                    name: faker.random.uuid(),
                    isActive: true,
                    isPaired: true,
                    status: deviceStatuses.OFFLINE,
                });
                await factory.create('pairing', {
                    machineId: machine.id,
                    deviceId: device.id,
                });

                await expect(checkInprogressTurnForMachine(payloadMock)).to.be.rejectedWith('Device is offline');
            });

            it('should reject if machine washer is in use', async () => {
                const machineType = await factory.create('machineType', {
                    name: MACHINE_TYPES.WASHER,
                });
                const machineModel = await factory.create('machineModel', {
                    typeId: machineType.id,
                });
                const machineWasher = await factory.create('machine', {
                    storeId: store.id,
                    modelId: machineModel.id,
                });
                const device = await factory.create('device', {
                    name: faker.random.uuid(),
                    isActive: true,
                    isPaired: true,
                    status: deviceStatuses.IN_USE,
                });
                await factory.create('pairing', {
                    machineId: machineWasher.id,
                    deviceId: device.id,
                });

                const payloadMock = {
                    machineId: machineWasher.id,
                    businessId: business.id,
                    serviceType: serviceTypes.SELF_SERVICE,
                };

                await expect(checkInprogressTurnForMachine(payloadMock)).to.be.rejectedWith('machine is in use');
            });
        });

        describe('when checking flow is success', () => {
            it('should return payload with machineDetails, deviceId and active pairing', async () => {
                const payloadMock = {
                    machineId: machine.id,
                    businessId: business.id,
                    serviceType: serviceTypes.SELF_SERVICE,
                };
                const device = await factory.create('device', {
                    name: faker.random.uuid(),
                    isActive: true,
                    isPaired: true,
                    status: deviceStatuses.ONLINE,
                });
                await factory.create('pairing', {
                    machineId: machine.id,
                    deviceId: device.id,
                });

                const machineDetails = await Machine.query()
                    .findById(machine.id)
                    .withGraphJoined(
                        '[store, model.[machineType], pairing.[device], machinePricings, machineTurnsStats]',
                    )
                    .where('store.businessId', business.id);

                const result = await checkInprogressTurnForMachine(payloadMock);

                expect(result).to.deep.equal({
                    businessId: business.id,
                    machineId: machine.id,
                    serviceType: payloadMock.serviceType,
                    deviceId: device.id,
                    activePairing: machineDetails.pairing[0],
                    machineDetails,
                });
            });
        });
    });
});
require('../../../testHelper');

const { intersectionBy } = require('lodash');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { expect } = require('../../../support/chaiHelper');
const { getMachinesListUow } = require('../../../../uow/machines/machinesList/machinesListUow');
const { MACHINE_TYPES } = require('../../../../constants/constants');

describe('machinesListValidation function test', () => {
    let user, business, store, machinesNetworked, machinesOffline;

    beforeEach(async () => {
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness, { userId: user.id });
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        machinesNetworked = await factory.createMany(FACTORIES_NAMES.machineWasherWithPairedOnlineDevice, 20, {
            storeId: store.id,
        });
        machinesOffline = await factory.createMany(FACTORIES_NAMES.machineWasher, 15, {
            storeId: store.id,
        });
    });

    describe('when "isPaired" param is processed', () => {
        it('should return offline machines if isPaired is false', async () => {
            const payloadMock = {
                storeIds: [store.id],
                page: 1,
                limit: 30,
                isPaired: false,
            };

            const result = await getMachinesListUow(payloadMock);

            expect(result).to.have.property('machines').to.be.an('array');
            expect(result).to.have.property('hasMore').to.be.eql(false);

            const machinesExpected = result.machines;

            const intersectedNetworkedMachines = intersectionBy(machinesNetworked, machinesExpected, 'id');
            expect(intersectedNetworkedMachines).to.have.property('length').to.be.eql(0);

            const intersectedOfflineMachines = intersectionBy(machinesOffline, machinesExpected, 'id');
            expect(intersectedOfflineMachines).to.have.property('length').to.be.eql(machinesExpected.length);
        });

        it('should return online machines if isPaired is true', async () => {
            const payloadMock = {
                storeIds: [store.id],
                page: 1,
                limit: 30,
                isPaired: true,
            };

            const result = await getMachinesListUow(payloadMock);

            expect(result).to.have.property('machines').to.be.an('array');
            expect(result).to.have.property('hasMore').to.be.eql(false);

            const machinesExpected = result.machines;

            const intersectedNetworkedMachines = intersectionBy(machinesNetworked, machinesExpected, 'id');
            expect(intersectedNetworkedMachines).to.have.property('length').to.be.eql(machinesExpected.length);

            const intersectedOfflineMachines = intersectionBy(machinesOffline, machinesExpected, 'id');
            expect(intersectedOfflineMachines).to.have.property('length').to.be.eql(0);
        });

        it('should return online and networked machines if isPaired is undefined', async () => {
            const payloadMock = {
                storeIds: [store.id],
                page: 1,
                limit: 30,
                isPaired: undefined,
            };

            const result = await getMachinesListUow(payloadMock);

            expect(result).to.have.property('machines').to.be.an('array');
            expect(result).to.have.property('hasMore').to.be.eql(true);

            const machinesExpected = result.machines;

            const intersectedNetworkedMachines = intersectionBy(machinesNetworked, machinesExpected, 'id');
            expect(intersectedNetworkedMachines).to.have.property('length').to.be.greaterThan(0);

            const intersectedOfflineMachines = intersectionBy(machinesOffline, machinesExpected, 'id');
            expect(intersectedOfflineMachines).to.have.property('length').to.be.greaterThan(0);
        });
    });

    describe('when "type" param is processed', () => {
        it('should return list of dryers', async () => {
            await factory.createMany(FACTORIES_NAMES.machineDryer, 15, {
                storeId: store.id,
            });
            const payloadMock = {
                storeIds: [store.id],
                page: 1,
                limit: 30,
                isPaired: undefined,
                type: MACHINE_TYPES.DRYER,
            };

            const result = await getMachinesListUow(payloadMock);

            expect(result).to.have.property('machines').to.be.an('array');
            expect(result).to.have.property('hasMore').to.be.a('boolean');

            const isDryers = result.machines.every(({ model }) => model.type === MACHINE_TYPES.DRYER);
            const isAnyWasher = result.machines.some(({ model }) => model.type === MACHINE_TYPES.WASHER);
            expect(isDryers).to.be.eql(true);
            expect(isAnyWasher).to.be.eql(false);
        });

        it('should return list of washers', async () => {
            await factory.createMany(FACTORIES_NAMES.machineDryer, 15, {
                storeId: store.id,
            });
            const payloadMock = {
                storeIds: [store.id],
                page: 1,
                limit: 30,
                isPaired: undefined,
                type: MACHINE_TYPES.WASHER,
            };

            const result = await getMachinesListUow(payloadMock);

            expect(result).to.have.property('machines').to.be.an('array');
            expect(result).to.have.property('hasMore').to.be.a('boolean');

            const isWashers = result.machines.every(({ model }) => model.type === MACHINE_TYPES.WASHER);
            const isAnyDryer = result.machines.some(({ model }) => model.type === MACHINE_TYPES.DRYER);
            expect(isWashers).to.be.eql(true);
            expect(isAnyDryer).to.be.eql(false);
        });
    });
});

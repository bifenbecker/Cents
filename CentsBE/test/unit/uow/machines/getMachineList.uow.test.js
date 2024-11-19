require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { getMachinesListUow } = require('../../../../uow/machines/machinesList/machinesListUow');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');

describe("test business-owner's machines list", () => {
    let store,
        business,
        machineTypeWasher,
        machineTypeDryer,
        machineModelWasher,
        machineModelDryer,
        machineWasher,
        machineDryer,
        deviceWasher,
        deviceDryer,
        user,
        payload;
    beforeEach(async () => {
        user = await factory.create(FACTORIES_NAMES.user);
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, { businessId: business.id });
        machineTypeWasher = await factory.create(FACTORIES_NAMES.machineTypeWasher);
        machineTypeDryer = await factory.create(FACTORIES_NAMES.machineTypeDryer);
        machineModelWasher = await factory.create(FACTORIES_NAMES.machineModelWasherType);
        machineModelDryer = await factory.create(FACTORIES_NAMES.machineModelDryerType);
        machineWasher = await factory.create(FACTORIES_NAMES.machine, {
            storeId: store.id,
            modelId: machineModelWasher.id,
            userId: user.id,
        });
        machineDryer = await factory.create(FACTORIES_NAMES.machine, {
            storeId: store.id,
            userId: user.id,
            modelId: machineModelDryer.id,
        });
        deviceWasher = await factory.create(FACTORIES_NAMES.device, { status: 'ONLINE', name: 'Test 1' });
        deviceDryer = await factory.create(FACTORIES_NAMES.device, { status: 'ONLINE', name: 'Test 2' });

        await factory.create(FACTORIES_NAMES.machinePricing, {
            machineId: machineWasher.id,
        });
        await factory.create(FACTORIES_NAMES.machinePricing, {
            machineId: machineDryer.id,
        });
        await factory.create(FACTORIES_NAMES.pairing, {
            deviceId: deviceWasher.id,
            machineId: machineWasher.id,
        });
        await factory.create(FACTORIES_NAMES.pairing, {
            deviceId: deviceDryer.id,
            machineId: machineDryer.id,
        });
    });

    it('should return machine list', async () => {
        payload = {
            storeIds: [store.id],
            page: 1,
            limit: 100,
        };

        const machineList = await getMachinesListUow(payload);

        expect(machineList).to.be.an('object');
        expect(machineList.machines).to.be.an('array');
        expect(machineList.machines.length).not.equals(0);
    });

    it('should return machine list filtered by type "WASHER"', async () => {
        payload = {
            storeIds: [store.id],
            page: 1,
            limit: 100,
            type: machineTypeWasher.name,
        };

        const machineList = await getMachinesListUow(payload);

        expect(machineList.machines[0].model.type).to.be.equal(machineTypeWasher.name);
    });

    it('should return machine list filtered by type "DRYER"', async () => {
        payload = {
            storeIds: [store.id],
            page: 1,
            limit: 100,
            type: machineTypeDryer.name,
        };

        const machineList = await getMachinesListUow(payload);

        expect(machineList.machines[0].model.type).to.be.equal(machineTypeDryer.name);
    });
});


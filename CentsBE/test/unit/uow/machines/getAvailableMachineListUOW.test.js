require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const getAvailableMachineListUOW = require('../../../../uow/machines/getAvailableMachineListUOW');

describe('getAvailableMachineListUOW test', function () {
    let store,
        business,
        machineTypeWasher,
        machineTypeDryer,
        machineModel,
        device,
        pairing,
        machine,
        user,
        payload;
    beforeEach(async () => {
        user = await factory.create('user');
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', { businessId: business.id });
        machineTypeWasher = await factory.create('machineTypeWasher');
        machineTypeDryer = await factory.create('machineTypeDryer');
        device = await factory.create('device', { status: 'ONLINE' });
        machineModel = await factory.create('machineModel', { typeId: machineTypeWasher.id });
        machine = await factory.create('machine', {
            storeId: store.id,
            modelId: machineModel.id,
            userId: user.id,
        });
        pairing = await factory.create('pairing', {
            deviceId: device.id,
            machineId: machine.id,
        });
        payload = {
            storeId: store.id,
            page: 1,
        };
    });

    it('should return correct data about washer machines', async () => {
        const res = await getAvailableMachineListUOW({
            ...payload,
            type: 'WASHER',
        });
        expect(res.machineList[0].prefix).equal('W');
        expect(res.machineList[0].device.status).equal(device.status);
    });

    it('should return correct data about dryer machines', async () => {
        const machineModelDryer = await factory.create('machineModel', {
            typeId: machineTypeDryer.id,
        });
        machine = await factory.create('machine', {
            storeId: store.id,
            modelId: machineModelDryer.id,
            userId: user.id,
        });
        const res = await getAvailableMachineListUOW({
            ...payload,
            type: 'DRYER',
        });
        expect(res.machineList[0].prefix).equal('D');
        expect(res.machineList[0].turnTimeInMinutes).equal(machine.turnTimeInMinutes);
    });

    it('should throw error if page is 0', async () => {
        await expect(
            getAvailableMachineListUOW({
                ...payload,
                type: 'WASHER',
                page: 0,
            }),
        ).to.be.rejected;
    });
});

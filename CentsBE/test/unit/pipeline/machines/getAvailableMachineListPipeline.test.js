require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const getAvailableMachineListPipeline = require('../../../../pipeline/machines/getAvailableMachineListPipeline');

describe('getAvailableMachineListPipeline test', function () {
    let store, business, machineType, machineModel, device, pairing, machine;
    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', { businessId: business.id });
        machineType = await factory.create('machineType');
        machineModel = await factory.create('machineModel', { typeId: machineType.id });
        device = await factory.create('device', { status: 'ONLINE' });
        machine = await factory.create('machine', {
            storeId: store.id,
            modelId: machineModel.id,
        });
        pairing = await factory.create('pairing', {
            deviceId: device.id,
            machineId: machine.id,
        });
    });

    it('should return expected result', async () => {
        const payload = {
            storeId: store.id,
            type: machineType.name,
            page: 1,
        };

        const res = await getAvailableMachineListPipeline(payload);
        expect(res.machineList[0].prefix).equal(machineType.name[0]);
        expect(res.machineList[0].device.status).equal(device.status);
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(getAvailableMachineListPipeline()).to.be.rejected;
        await expect(getAvailableMachineListPipeline(null)).to.be.rejected;
        await expect(getAvailableMachineListPipeline({})).to.be.rejected;
    });
});

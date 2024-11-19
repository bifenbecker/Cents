require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const getMachineStatsPipeline = require('../../../../pipeline/machines/getMachineStatsPipeline');

describe('getMachineStatsPipeline test', function () {
    let user, store, device, business, storeIds, machine, machineType, machineModel;
    beforeEach(async () => {
        user = await factory.create('user');
        business = await factory.create('laundromatBusiness', { userId: user.id });
        store = await factory.createMany('store', 3, { businessId: business.id });
        device = await factory.create('device');
        machineType = await factory.createMany('machineType', 3);
        machineModel = await factory.create('machineModel', { typeId: machineType[0].id });
        storeIds = store.map((s) => s.id);
        for (id of storeIds) {
            await factory.create('machine', {
                modelId: machineModel.id,
                storeId: id,
                userId: user.id,
            });
        }
    });

    it('should return expected result', async () => {
        const payload = {
            storeIds,
            origin: 'EMPLOYEE_TAB',
        };

        const res = await getMachineStatsPipeline(payload);
        expect(res.stats.washersCount).equal(machineType.length);
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(getMachineStatsPipeline()).to.be.rejected;
        await expect(getMachineStatsPipeline(null)).to.be.rejected;
        await expect(getMachineStatsPipeline({})).to.be.rejected;
    });
});

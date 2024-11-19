require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const getUnpairedOnlineDevicesPipeline = require('../../../../pipeline/machines/getUnPairedOnlineDevicesPipeline');

describe('getUnpairedOnlineDevicesPipeline test', () => {
    let user, store, device, business, storeIds, batch;
    beforeEach(async () => {
        store = await factory.createMany('store', 3);
        user = await factory.create('user');
        business = await factory.create('laundromatBusiness', { userId: user.id });
        batch = await factory.createMany('batch', 3, {
            businessId: business.id,
            storeId: store[0].id,
        });
        device = await factory.create('device', {
            batchId: batch[0].id,
            status: 'ONLINE',
            isPaired: false,
        });
        storeIds = store.map((s) => s.id);
    });

    it('should return expected result', async () => {
        const payload = {
            storeIds,
            page: 1,
        };

        const result = await getUnpairedOnlineDevicesPipeline(payload);

        expect(result.devices[0].id).equal(device.id);
        expect(result.devices[0].store.id).equal(store[0].id);
        expect(result.devices[0].store.address).equal(store[0].address);
        expect(result.devices[0].store.name).equal(store[0].name);
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(getUnpairedOnlineDevicesPipeline()).to.be.rejected;
        await expect(getUnpairedOnlineDevicesPipeline(null)).to.be.rejected;
        await expect(getUnpairedOnlineDevicesPipeline({})).to.be.rejected;
    });
});

require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { unPairedOnlineDeviceList } = require('../../../../uow/machines/devices/list');

describe('unPairedOnlineDeviceList uow test', () => {
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
            isPaired: false,
            status: 'ONLINE',
        });
        storeIds = store.map((s) => s.id);
    });

    it('should return list of unpaired devices', async () => {
        const payload = {
            storeIds,
            page: 1,
            keyword: device.name,
        };

        const result = await unPairedOnlineDeviceList(payload);

        expect(result.devices[0]).to.include({
            id: device.id,
        });
        expect(result.devices[0].store).to.include({
            id: store[0].id,
            address: store[0].address,
            name: store[0].name,
        });
    });

    it('should throw an error if turn was not found', async () => {
        const payload = {
            storeIds: 12345,
            page: null,
        };

        try {
            await unPairedOnlineDeviceList(payload);
        } catch (e) {
            expect(e).to.be.instanceof(Error);
        }
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(unPairedOnlineDeviceList()).to.be.rejected;
        await expect(unPairedOnlineDeviceList(null)).to.be.rejected;
        await expect(unPairedOnlineDeviceList({})).to.be.rejected;
    });
});

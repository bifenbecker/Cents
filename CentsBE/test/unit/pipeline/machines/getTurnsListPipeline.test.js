require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const getTurnsListPipeline = require('../../../../pipeline/machines/getTurnsListPipeline');

describe('test getTurnsListPipeline', () => {
    let machine, store;

    beforeEach(async () => {
        const user = await factory.create('userWithBusinessOwnerRole'),
            business = await factory.create('laundromatBusiness', { userId: user.id });

        store = await factory.create('store', {
            businessId: business.id,
        });
        machine = await factory.create('machine', {
            storeId: store.id,
        });
    });

    it('should return turns list', async () => {
        const device1 = await factory.create('device', {
                name: 'AA955',
            }),
            turn1 = await factory.create('turn', {
                storeId: store.id,
                machineId: machine.id,
                deviceId: device1.id,
            });

        const device2 = await factory.create('device', {
                name: 'AA956',
            }),
            turn2 = await factory.create('turn', {
                storeId: store.id,
                machineId: machine.id,
                deviceId: device2.id,
            });

        const payload = {
            machineId: machine.id,
            page: 1,
        };

        const result = await getTurnsListPipeline(payload);

        expect(result.turns[0].id).to.equal(turn2.id);
        expect(result.turns[1].id).to.equal(turn1.id);
    });

    it('should return turns list with hasMore property', async () => {
        const device1 = await factory.create('device', {
            name: 'AA955',
        });

        await factory.create('turn', {
            storeId: store.id,
            machineId: machine.id,
            deviceId: device1.id,
        });

        const device2 = await factory.create('device', {
                name: 'AA956',
            }),
            turn = await factory.create('turn', {
                storeId: store.id,
                machineId: machine.id,
                deviceId: device2.id,
            });

        const payload = {
            machineId: machine.id,
            page: 1,
            limit: 1,
        };

        const result = await getTurnsListPipeline(payload);

        expect(result.turns[0].id).to.equal(turn.id);
        expect(result.hasMore).to.be.true;
    });

    it('should return turns list without deleted turns', async () => {
        const device = await factory.create('device', {
                name: 'AA955',
            }),
            turn = await factory.create('turn', {
                storeId: store.id,
                machineId: machine.id,
                deviceId: device.id,
            });

        await factory.create('turn', {
            storeId: store.id,
            machineId: machine.id,
            deletedAt: '2016-06-22 19:10:25-07',
        });

        const payload = {
            machineId: machine.id,
            page: 1,
            limit: 1,
        };

        const result = await getTurnsListPipeline(payload);

        expect(result.turns[0].id).to.equal(turn.id);
        expect(result.turns.length).to.equal(1);
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(getTurnsListPipeline()).to.be.rejected;
        await expect(getTurnsListPipeline(null)).to.be.rejected;
        await expect(getTurnsListPipeline({})).to.be.rejected;
    });

    it('should fail if machine was not found', async () => {
        const payload = {
            machineId: 99999,
            page: 1,
        };

        await expect(getTurnsListPipeline(payload)).to.be.rejectedWith('Invalid machine id.');
    });
});

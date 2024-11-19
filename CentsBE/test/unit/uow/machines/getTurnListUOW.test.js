require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const getTurnListUOW = require('../../../../uow/machines/getTurnListUOW');

describe('test getTurnListUOW', () => {
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

        const result = await getTurnListUOW(payload);

        expect(result.hasMore).to.be.false;

        expect(result.turns[0].id).to.equal(turn2.id);
        expect(result.turns[0]).to.include.keys([
            'prefix',
            'code',
            'createdAt',
            'updatedAt',
            'completedAt',
            'serviceType',
        ]);

        expect(result.turns[1].id).to.equal(turn1.id);
        expect(result.turns[1]).to.include.keys([
            'prefix',
            'code',
            'createdAt',
            'updatedAt',
            'completedAt',
            'serviceType',
        ]);
    });

    it('should return turns list with true hasMore property', async () => {
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

        const result = await getTurnListUOW(payload);

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

        const result = await getTurnListUOW(payload);

        expect(result.turns[0].id).to.equal(turn.id);
        expect(result.turns.length).to.equal(1);
    });

    it('should return turns with washer prefix', async () => {
        const machineType = await factory.create('machineType', {
                name: 'WASHER',
            }),
            machineModel = await factory.create('machineModel', {
                typeId: machineType.id,
            });
        machine = await factory.create('machine', {
            storeId: store.id,
            modelId: machineModel.id,
        });

        const device = await factory.create('device', {
                name: 'AA955',
            }),
            turn = await factory.create('turn', {
                storeId: store.id,
                machineId: machine.id,
                deviceId: device.id,
            });

        const payload = {
            machineId: machine.id,
            page: 1,
        };

        const result = await getTurnListUOW(payload);

        expect(result.turns[0].id).to.equal(turn.id);
        expect(result.turns[0].prefix).to.equal('WT');
    });

    it('should return turns with dryer prefix', async () => {
        const machineType = await factory.create('machineType', {
                name: 'DRYER',
            }),
            machineModel = await factory.create('machineModel', {
                typeId: machineType.id,
            });
        machine = await factory.create('machine', {
            storeId: store.id,
            modelId: machineModel.id,
        });

        const device = await factory.create('device', {
                name: 'AA955',
            }),
            turn = await factory.create('turn', {
                storeId: store.id,
                machineId: machine.id,
                deviceId: device.id,
            });

        const payload = {
            machineId: machine.id,
            page: 1,
        };

        const result = await getTurnListUOW(payload);

        expect(result.turns[0].id).to.equal(turn.id);
        expect(result.turns[0].prefix).to.equal('DT');
    });

    it('should return empty turns list', async () => {
        const payload = {
            machineId: machine.id,
            page: 1,
        };

        const result = await getTurnListUOW(payload);

        expect(result.hasMore).to.be.false;
        expect(result.turns.length).to.equal(0);
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(getTurnListUOW()).to.be.rejected;
        await expect(getTurnListUOW(null)).to.be.rejected;
        await expect(getTurnListUOW({})).to.be.rejected;
    });
});

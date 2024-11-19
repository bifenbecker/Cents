require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { getMachineStats } = require('../../../../uow/machines/getMachineStatsUOW');

describe('getMachineStatsUOW test', function () {
    describe('for employee tab origin', function () {
        const origin = 'EMPLOYEE_TAB';
        let store,
            device,
            business,
            storeIds,
            machineTypeWasher,
            machineTypeDryer,
            batch,
            machineModelWasher,
            machineModelDryer;
        beforeEach(async () => {
            business = await factory.create('laundromatBusiness');
            store = await factory.createMany('store', 3, { businessId: business.id });
            batch = await factory.create('batch', {
                storeId: store[0].id,
                businessId: business.id,
            });
            device = await factory.create('device', {
                status: 'ONLINE',
                isPaired: false,
                isActive: false,
                batchId: batch.id,
            });
            machineTypeWasher = await factory.create('machineTypeWasher');
            machineTypeDryer = await factory.create('machineTypeDryer');
            machineModelWasher = await factory.createMany('machineModel', 3, {
                typeId: machineTypeWasher.id,
            });

            machineModelDryer = await factory.createMany('machineModel', 3, {
                typeId: machineTypeDryer.id,
            });
            storeIds = store.map((s) => s.id);
            for (id of storeIds) {
                const idx = storeIds.indexOf(id);
                await factory.create('machine', {
                    modelId: machineModelWasher[idx].id,
                    storeId: id,
                });
                await factory.create('machine', {
                    modelId: machineModelDryer[idx].id,
                    storeId: id,
                });
            }
        });

        it('should return correct number of dryers and washers', async () => {
            const payload = {
                storeIds,
                origin,
            };

            const result = await getMachineStats(payload);
            expect(result.stats.washersCount).equal(3);
            expect(result.stats.dryersCount).equal(3);
        });

        it('should return correct number of unpaired devices', async () => {
            const payload = {
                unPairedDevicesCount: true,
                storeIds,
                origin,
            };

            const result = await getMachineStats(payload);
            expect(result.stats.unpairedDevices).equal(1);
        });

        it('should be rejected when no store ids provided', async () => {
            const payload = {
                storeIds: [],
                origin,
            };
            await expect(getMachineStats(payload)).to.be.rejected;
        });

    });
});

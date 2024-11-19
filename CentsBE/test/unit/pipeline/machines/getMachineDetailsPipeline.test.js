require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const getMachineDetailsPipeline = require('../../../../pipeline/machines/getMachineDetailsPipeline');

describe('test getMachineDetailsPipeline', () => {
    let business;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
    });

    it('should return expected result', async () => {
        const store = await factory.create('store', {
                businessId: business.id,
            }),
            machine = await factory.create('machine', {
                storeId: store.id,
            });

        const payload = {
            id: machine.id,
            businessId: business.id,
        };

        const result = await getMachineDetailsPipeline(payload);

        expect(result).to.include({
            id: machine.id,
            name: machine.name,
            serialNumber: machine.serialNumber,
            turnTimeInMinutes: machine.turnTimeInMinutes,
        });
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(getMachineDetailsPipeline()).to.be.rejected;
        await expect(getMachineDetailsPipeline(null)).to.be.rejected;
        await expect(getMachineDetailsPipeline({})).to.be.rejected;
    });
});

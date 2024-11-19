require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const {
    getMachineConfigurationUow,
} = require('../../../../../uow/machines/machineDetails/getMachineConfigurationUow');

describe('test getMachineConfigurationUow', () => {
    let machine, configuration;

    beforeEach(async () => {
        machine = await factory.create('machine');
        configuration = await factory.create('machineConfiguration', {
            LaundryMachineID: machine.id,
        });
    });

    it('should return machine configuration', async () => {
        const payload = {
            machineId: machine.id,
        };
        await getMachineConfigurationUow(payload);

        expect(payload.machineConfiguration.LMID).to.equal(configuration.LMID);
    });

    it('should be rejected if invalid args were passed', async () => {
        await expect(getMachineConfigurationUow()).to.be.rejected;
        await expect(getMachineConfigurationUow(null)).to.be.rejected;
    });
});

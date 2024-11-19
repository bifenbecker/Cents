require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');

const { getMachineByNameAndStore } = require('../../../../services/machines/queries');
const Machine = require('../../../../models/machine');

describe('test services machine/queries getMachineByNameAndStore', () => {
    let store;

    beforeEach(async () => {
        store = await factory.create(FACTORIES_NAMES.store);
    });
    describe('when a machine with case insensitive name exists in the store', () => {
        it('should return a machine when such a case sensitive name exists', async () => {
            const machineName = 'Detroit'
            const machine = await factory.create(FACTORIES_NAMES.machine, {
                storeId: store.id,
                name: machineName,
            });

            const result = await getMachineByNameAndStore(machineName, store.id);
            const machineExpected = await Machine.query().findById(machine.id);

            expect(result).not.to.be.undefined;
            expect(result).to.deep.equal(machineExpected);
        });

        it('should return a machine when such a case insensitive name exists', async () => {
            const machineName = 'DEtRoiT'
            const machine = await factory.create(FACTORIES_NAMES.machine, {
                storeId: store.id,
                name: machineName,
            });

            const result = await getMachineByNameAndStore(machineName.toUpperCase(), store.id);
            const machineExpected = await Machine.query().findById(machine.id);

            expect(result).not.to.be.undefined;
            expect(result).to.deep.equal(machineExpected);
        });
    });

    describe('when a machine with case insensitive name does not exist in the store', () => {
        it('should return undefined', async () => {
            const machineName = 'Aurora';
            await factory.create(FACTORIES_NAMES.machine, {
                name: machineName,
            });

            const result = await getMachineByNameAndStore('Agora', store.id);

            expect(result).to.be.undefined;
        });
    });
});

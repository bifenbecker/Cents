require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const MachineConfiguration = require('../../../mongooseModels/machineConfiguration');
const { hasCollection, hasPath } = require('../../support/mongodbHelper');

describe('test machineConfiguration model', () => {
    it('should return true if machine configurations collection exists', () => {
        const hasCollectionName = hasCollection(MachineConfiguration.collection.collectionName);
        expect(hasCollectionName).to.be.true;
    });

    it('turns should have main paths', () => {
        hasPath(MachineConfiguration, 'LMID');
        hasPath(MachineConfiguration, 'LaundryMachineID');
        hasPath(MachineConfiguration, 'PennyID');
        hasPath(MachineConfiguration, 'CurrentTimeStamp');
        hasPath(MachineConfiguration, 'LaundryMachineType');
        hasPath(MachineConfiguration, 'LaundryMachineModel');
        hasPath(MachineConfiguration, 'CommandGroupId');
        hasPath(MachineConfiguration, 'IdempotencyKey');
        hasPath(MachineConfiguration, 'LaundryMachineFeatures');
    });
});

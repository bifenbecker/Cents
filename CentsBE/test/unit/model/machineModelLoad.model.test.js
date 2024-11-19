require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasTable, hasAssociation, belongsToOne, hasMany } = require('../../support/objectionTestHelper');
const MachineModelLoad = require('../../../models/machineModelLoad');

describe('test MachineModelLoad model', () => {
    it('should return true if machineModelLoads table exists', async () => {
        const hasTableName = await hasTable(MachineModelLoad.tableName);
        expect(hasTableName).to.be.true;
    });

    it('machineModelLoads should have machinePricing association', () => {
        hasAssociation(MachineModelLoad, 'pricing');
    });

    it('machineModelLoads should HasManyRelation pricing association', () => {
        hasMany(MachineModelLoad, 'pricing');
    });

    it('machineModelLoads should have machineLoadType association', () => {
        hasAssociation(MachineModelLoad, 'machineLoadType');
    });

    it('machineModelLoads should BelongsToOneRelation machineLoadType association', () => {
        belongsToOne(MachineModelLoad, 'machineLoadType');
    });
});

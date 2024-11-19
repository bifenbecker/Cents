require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation, hasTable, hasMany } = require('../../support/objectionTestHelper');
const MachineType = require('../../../models/machineType');

describe('test machineType model', () => {
    it('should return true if laundromatBusiness table exists', async () => {
        const hasTableName = await hasTable(MachineType.tableName);
        expect(hasTableName).to.be.true;
    });

    it('machineType should have machinemodel association ', () => {
        hasAssociation(MachineType, 'models');
    });

    it('machineType should HasManyRelation machinemodel association ', () => {
        hasMany(MachineType, 'models');
    });
});

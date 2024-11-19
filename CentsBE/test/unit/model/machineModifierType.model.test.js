require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasTable, hasManyToMany } = require('../../support/objectionTestHelper');
const MachineModifierType = require('../../../models/machineModifierType');

describe('test MachineModifierType model', () => {
    it('should return true if machineModifierTypes table exists', async () => {
        const hasTableName = await hasTable(MachineModifierType.tableName);
        expect(hasTableName).to.be.true;
    });

    it('machineModifierTypes should have ManyToManyRelation models association', () => {
        hasManyToMany(MachineModifierType, 'models');
    });
});

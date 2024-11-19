require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasTable, hasAssociation, belongsToOne, hasMany } = require('../../support/objectionTestHelper');
const MachineModelModifier = require('../../../models/machineModelModifier');

describe('test MachineModelModifier model', () => {
    it('should return true if machineModelModifiers table exists', async () => {
        const hasTableName = await hasTable(MachineModelModifier.tableName);
        expect(hasTableName).to.be.true;
    });

    it('machineModelModifiers should have machinePricing association', () => {
        hasAssociation(MachineModelModifier, 'pricing');
    });

    it('machineModelModifiers should HasManyRelation machine association', () => {
        hasMany(MachineModelModifier, 'pricing');
    });

    it('machineModelModifiers should have machineModifierType association', () => {
        hasAssociation(MachineModelModifier, 'machineModifierType');
    });

    it('machineModelModifiers should BelongsToOneRelation machineModifierType association', () => {
        belongsToOne(MachineModelModifier, 'machineModifierType');
    });
});

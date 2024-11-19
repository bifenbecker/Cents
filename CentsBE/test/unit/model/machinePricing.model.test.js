require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasTable, hasAssociation, belongsToOne } = require('../../support/objectionTestHelper');
const MachinePricing = require('../../../models/machinePricing');

describe('test machinePricing model', () => {
    it('should return true if machinePricing table exists', async () => {
        const hasTableName = await hasTable(MachinePricing.tableName);
        expect(hasTableName).to.be.true;
    });

    it('machinePricing should have machine association', () => {
        hasAssociation(MachinePricing, 'machine');
    });

    it('machinePricing should BelongsToOneRelation machine association', () => {
        belongsToOne(MachinePricing, 'machine');
    });

    it('machinePricing should BelongsToOneRelation machineModelLoad association', () => {
        belongsToOne(MachinePricing, 'machineModelLoad');
    });

    it('machinePricing should BelongsToOneRelation machineModelModifier association', () => {
        belongsToOne(MachinePricing, 'machineModelModifier');
    });

    it('machinePricing model should return id column', () => {
        expect(MachinePricing.idColumn).to.equal('id');
    });
});

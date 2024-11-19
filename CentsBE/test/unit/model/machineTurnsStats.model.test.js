require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasTable, hasAssociation, belongsToOne } = require('../../support/objectionTestHelper');
const MachineTurnsStats = require('../../../models/machineTurnsStats');

describe('test machineTurnsStats model', () => {
    it('should return true if machineTurnsStats table exists', async () => {
        const hasTableName = await hasTable(MachineTurnsStats.tableName);
        expect(hasTableName).to.be.true;
    });

    it('machines should have machine association', () => {
        hasAssociation(MachineTurnsStats, 'machine');
    });

    it('machines should BelongsToOneRelation machine association', () => {
        belongsToOne(MachineTurnsStats, 'machine');
    });

    it('machineTurnsStats model should return id column', () => {
        expect(MachineTurnsStats.idColumn).to.equal('id');
    });
});

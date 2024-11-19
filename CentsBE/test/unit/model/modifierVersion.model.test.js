require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasTable, hasOne } = require('../../support/objectionTestHelper');
const ModifierVersion = require('../../../models/modifierVersions');

describe('test ModifierVersion model', () => {
    it('should return true if ModifierVersion table exists', async () => {
        const hasTableName = await hasTable(ModifierVersion.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', () => {
        expect(ModifierVersion.idColumn).to.equal('id');
    });

    it('ModifierVersion should have modifier association', () => {
        hasOne(ModifierVersion, 'modifier');
    });
});

require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasTable, hasAssociation, hasOne } = require('../../support/objectionTestHelper');
const TeamMemberStores = require('../../../models/teamMemberStore');

describe('test teamMemberStore model', () => {
    it('should return true if teamMemberStores table exists', async () => {
        const hasTableName = await hasTable(TeamMemberStores.tableName);
        expect(hasTableName).to.be.true;
    });

    it('teamMemberStore should have teamMember association', () => {
        hasAssociation(TeamMemberStores, 'teamMember');
    });

    it('teamMemberStore should HasOneRelation teamMember association', () => {
        hasOne(TeamMemberStores, 'teamMember');
    });

    it('teamMemberStore should have store association', () => {
        hasAssociation(TeamMemberStores, 'store');
    });

    it('teamMemberStore should HasOneRelation store association', () => {
        hasOne(TeamMemberStores, 'store');
    });

    it('teamMemberStore model should return id column', () => {
        expect(TeamMemberStores.idColumn).to.equal('id');
    });
});

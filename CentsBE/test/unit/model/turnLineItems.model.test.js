require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasTable, hasAssociation, belongsToOne } = require('../../support/objectionTestHelper');
const TurnLineItem = require('../../../models/turnLineItems');

describe('test turnLineItems model', () => {
    it('should return true if turnLineItems table exists', async () => {
        const hasTableName = await hasTable(TurnLineItem.tableName);
        expect(hasTableName).to.be.true;
    });

    it('turnLineItems should have turn association', () => {
        hasAssociation(TurnLineItem, 'turn');
    });

    it('turnLineItems should BelongsToOneRelation turn association', () => {
        belongsToOne(TurnLineItem, 'turn');
    });

    it('turnLineItems model should return id column', () => {
        expect(TurnLineItem.idColumn).to.equal('id');
    });
});

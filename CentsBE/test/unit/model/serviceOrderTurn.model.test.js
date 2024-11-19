require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasTable, hasAssociation, belongsToOne } = require('../../support/objectionTestHelper');
const ServiceOrderTurn = require('../../../models/serviceOrderTurn');

describe('test serviceOrderTurn model', () => {
    it('should return true if serviceOrderTurns table exists', async () => {
        const hasTableName = await hasTable(ServiceOrderTurn.tableName);
        expect(hasTableName).to.be.true;
    });

    it('serviceOrderTurn should have turn association', () => {
        hasAssociation(ServiceOrderTurn, 'turn');
    });

    it('serviceOrderTurn should BelongsToOneRelation turn association', () => {
        belongsToOne(ServiceOrderTurn, 'turn');
    });

    it('serviceOrderTurn should have serviceOrder association', () => {
        hasAssociation(ServiceOrderTurn, 'serviceOrder');
    });

    it('serviceOrderTurn should BelongsToOneRelation serviceOrder association', () => {
        belongsToOne(ServiceOrderTurn, 'serviceOrder');
    });

    it('serviceOrderTurn model should return id column', () => {
        expect(ServiceOrderTurn.idColumn).to.equal('id');
    });
});

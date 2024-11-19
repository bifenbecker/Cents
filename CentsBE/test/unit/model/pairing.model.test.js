require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasTable, hasAssociation, belongsToOne } = require('../../support/objectionTestHelper');
const Pairing = require('../../../models/pairing');
const factory = require('../../factories');

describe('test pairing model', () => {
    it('should return true if pairing table exists', async () => {
        const hasTableName = await hasTable(Pairing.tableName);
        expect(hasTableName).to.be.true;
    });

    it('pairing should have machine association', () => {
        hasAssociation(Pairing, 'machine');
    });

    it('pairing should BelongsToOneRelation machine association', () => {
        belongsToOne(Pairing, 'machine');
    });

    it('pairing should have device association', () => {
        hasAssociation(Pairing, 'device');
    });

    it('pairing should BelongsToOneRelation device association', () => {
        belongsToOne(Pairing, 'device');
    });

    it('pairing should have pairedBy association', () => {
        hasAssociation(Pairing, 'pairedBy');
    });

    it('pairing should BelongsToOneRelation pairedBy association', () => {
        belongsToOne(Pairing, 'pairedBy');
    });

    it('pairing should have unPairedBy association', () => {
        hasAssociation(Pairing, 'unPairedBy');
    });

    it('pairing should BelongsToOneRelation unPairedBy association', () => {
        belongsToOne(Pairing, 'unPairedBy');
    });

    it('pairing model should return id column', () => {
        expect(Pairing.idColumn).to.equal('id');
    });

    it('updatedAt field should be set after a pairing update', async () => {
        const pairing = await factory.create('pairing', {
            origin: 'EMPLOYEE_TAB',
        });

        const currDate = new Date();

        const updatedPairing = await Pairing.query()
            .patch({
                origin: 'BUSINESS_MANAGER',
            })
            .findById(pairing.id)
            .returning('*');

        expect(updatedPairing.updatedAt).to.exist;
        expect(new Date(updatedPairing.updatedAt)).to.be.greaterThanOrEqual(currDate);
    });
});

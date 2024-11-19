require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasTable,
    hasAssociation,
    belongsToOne,
    hasMany,
    hasOne,
} = require('../../support/objectionTestHelper');
const Turns = require('../../../models/turns');
const factory = require('../../factories');

describe('test turns model', () => {
    it('should return true if turns table exists', async () => {
        const hasTableName = await hasTable(Turns.tableName);
        expect(hasTableName).to.be.true;
    });

    it('turns should have store association', () => {
        hasAssociation(Turns, 'store');
    });

    it('turns should BelongsToOneRelation store association', () => {
        belongsToOne(Turns, 'store');
    });

    it('turns should have storeCustomer association', () => {
        hasAssociation(Turns, 'storeCustomer');
    });

    it('turns should BelongsToOneRelation storeCustomer association', () => {
        belongsToOne(Turns, 'storeCustomer');
    });

    it('turns should have machine association', () => {
        hasAssociation(Turns, 'machine');
    });

    it('turns should BelongsToOneRelation machine association', () => {
        belongsToOne(Turns, 'machine');
    });

    it('turns should have device association', () => {
        hasAssociation(Turns, 'device');
    });

    it('turns should BelongsToOneRelation device association', () => {
        belongsToOne(Turns, 'device');
    });

    it('turns should have order association', () => {
        hasAssociation(Turns, 'order');
    });

    it('turns should HasOneRelation order association', () => {
        hasOne(Turns, 'order');
    });

    it('turns should have turnLineItems association', () => {
        hasAssociation(Turns, 'turnLineItems');
    });

    it('turns should have many turnLineItems association', () => {
        hasMany(Turns, 'turnLineItems');
    });

    it('turns should have machinePayments association', () => {
        hasAssociation(Turns, 'machinePayments');
    });

    it('turns should have many machinePayments association', () => {
        hasMany(Turns, 'machinePayments');
    });

    it('turns should have serviceOrderTurn association', () => {
        hasAssociation(Turns, 'serviceOrderTurn');
    });

    it('turns should BelongsToOneRelation serviceOrderTurn association', () => {
        belongsToOne(Turns, 'serviceOrderTurn');
    });

    it('turns should have createdBy association', () => {
        hasAssociation(Turns, 'createdBy');
    });

    it('turns should BelongsToOneRelation createdBy association', () => {
        belongsToOne(Turns, 'createdBy');
    });

    it('should update fields after an instance have been updated', async () => {
        const turn = await factory.create('turn', {
            updatedAt: new Date().toISOString(),
        });

        const updatedTurn = await Turns.query()
            .patch({
                origin: 'BUSINESS_MANAGER',
            })
            .findById(turn.id)
            .returning('*');

        expect(new Date(updatedTurn.updatedAt)).to.be.greaterThan(new Date(turn.updatedAt));
    });
});

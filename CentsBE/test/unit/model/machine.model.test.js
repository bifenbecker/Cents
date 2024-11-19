require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasTable,
    hasAssociation,
    belongsToOne,
    hasMany,
    hasOne,
} = require('../../support/objectionTestHelper');
const MachineTurnsStats = require('../../../models/machineTurnsStats');
const Machine = require('../../../models/machine');
const factory = require('../../factories');

describe('test machine model', () => {
    it('should return true if machines table exists', async () => {
        const hasTableName = await hasTable(Machine.tableName);
        expect(hasTableName).to.be.true;
    });

    it('machines should have machinePricings association', () => {
        hasAssociation(Machine, 'machinePricings');
    });

    it('machines should have many machinePricings association', () => {
        hasMany(Machine, 'machinePricings');
    });

    it('machines should have store association', () => {
        hasAssociation(Machine, 'store');
    });

    it('machines should BelongsToOneRelation store association', () => {
        belongsToOne(Machine, 'store');
    });

    it('machines should have pairing association', () => {
        hasAssociation(Machine, 'pairing');
    });

    it('machines should have many pairing association', () => {
        hasMany(Machine, 'pairing');
    });

    it('machines should have turns association', () => {
        hasAssociation(Machine, 'turns');
    });

    it('machines should have many turns association', () => {
        hasMany(Machine, 'turns');
    });

    it('machines should have model association', () => {
        hasAssociation(Machine, 'model');
    });

    it('machines should BelongsToOneRelation model association', () => {
        belongsToOne(Machine, 'model');
    });

    it('machines should have createdBy association', () => {
        hasAssociation(Machine, 'createdBy');
    });

    it('machines should BelongsToOneRelation createdBy association', () => {
        belongsToOne(Machine, 'createdBy');
    });

    it('machines should have machineTurnsStats association', () => {
        hasAssociation(Machine, 'machineTurnsStats');
    });

    it('machines should HasOneRelation machineTurnsStats association', () => {
        hasOne(Machine, 'machineTurnsStats');
    });

    it('machine model should return id column', () => {
        expect(Machine.idColumn).to.equal('id');
    });

    it('related machine turns stats should be created after a machine creation', async () => {
        const machine = await factory.create('machine');
        const machineTurnsStats = (
            await MachineTurnsStats.query().where({
                machineId: machine.id,
            })
        )[0];

        expect(machineTurnsStats.machineId).to.equal(machine.id);
        expect(machineTurnsStats.avgTurnsPerDay).to.equal(0);
        expect(machineTurnsStats.avgSelfServeRevenuePerDay).to.equal(0);
    });
});

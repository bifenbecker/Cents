require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation,
        hasTable,
        belongsToOne,
        hasOne,
} = require('../../support/objectionTestHelper');
const WeightLog = require('../../../models/weightLog');
const factory = require('../../factories');

describe('test WeightLog model', () => {
    it('should return true if itemWeights table exists', async () => {
        const hasTableName = await hasTable(WeightLog.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', async () => {
        expect(WeightLog.idColumn).to.equal('id');
    });

    it('WeightLog should have orderItem association', () => {
        hasAssociation(WeightLog, 'orderItem');
    });

    it('WeightLog should BelongsToOneRelation orderItem association', async () => {
        belongsToOne(WeightLog, 'orderItem');
    });

    it('WeightLog should have teamMember association', () => {
        hasAssociation(WeightLog, 'teamMember');
    });

    it('WeightLog should HasOneRelation teamMember association', async () => {
        hasOne(WeightLog, 'teamMember');
    });

    it('WeightLog model should have getOrderItem method when created', async () => {
        const weightLog = await factory.create('weightLog');
        expect(weightLog.getOrderItem).to.be.a('function');
    });

    it('WeightLog model getOrderItem method should return orderItem', async () => {
        const serviceOrderItem = await factory.create('serviceOrderItem'),
            weightLog = await factory.create('weightLog', {
                orderItemId: serviceOrderItem.id,
            });
        expect((await weightLog.getOrderItem()).id).to.be.eq(serviceOrderItem.id);
    });

    it('WeightLog model should have getTeamMember method when created', async () => {
        const weightLog = await factory.create('weightLog');
        expect(weightLog.getTeamMember).to.be.a('function');
    });

    it('WeightLog model getTeamMember method should return teamMember', async () => {
        const teamMember = await factory.create('teamMember'),
            weightLog = await factory.create('weightLog', {
                teamMemberId: teamMember.id,
            });
        expect((await weightLog.getTeamMember()).id).to.be.eq(teamMember.id);
    });
});

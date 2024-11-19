require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation,
        hasTable,
        belongsToOne,
        hasMany,
} = require('../../support/objectionTestHelper');
const ServiceOrderWeights = require('../../../models/serviceOrderWeights');
const factory = require('../../factories');

describe('test ServiceOrderWeights model', () => {
    it('should return true if serviceOrderWeights table exists', async () => {
        const hasTableName = await hasTable(ServiceOrderWeights.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', async () => {
        expect(ServiceOrderWeights.idColumn).to.equal('id');
    });

    it('ServiceOrderWeights should have order association', () => {
        hasAssociation(ServiceOrderWeights, 'order');
    });

    it('ServiceOrderWeights should BelongsToOneRelation order association', async () => {
        belongsToOne(ServiceOrderWeights, 'order');
    });

    it('ServiceOrderWeights should have teamMember association', () => {
        hasAssociation(ServiceOrderWeights, 'teamMember');
    });

    it('ServiceOrderWeights should BelongsToOneRelation teamMember association', async () => {
        belongsToOne(ServiceOrderWeights, 'teamMember');
    });

    it('ServiceOrderWeights should have editedByTeamMember association', () => {
        hasAssociation(ServiceOrderWeights, 'editedByTeamMember');
    });

    it('ServiceOrderWeights should BelongsToOneRelation editedByTeamMember association', async () => {
        belongsToOne(ServiceOrderWeights, 'editedByTeamMember');
    });

    it('ServiceOrderWeights should have serviceReferenceItem association', () => {
        hasAssociation(ServiceOrderWeights, 'serviceReferenceItem');
    });

    it('ServiceOrderWeights should BelongsToOneRelation serviceReferenceItem association', async () => {
        belongsToOne(ServiceOrderWeights, 'serviceReferenceItem');
    });

    it('ServiceOrderWeights should have adjustedByEmployee association', () => {
        hasAssociation(ServiceOrderWeights, 'adjustedByEmployee');
    });

    it('ServiceOrderWeights should BelongsToOneRelation adjustedByEmployee association', async () => {
        belongsToOne(ServiceOrderWeights, 'adjustedByEmployee');
    });

    it('ServiceOrderWeights model should have getOrders method when created', async () => {
        const serviceOrderWeight = await factory.create('serviceOrderWeight');
        expect(serviceOrderWeight.getOrders).to.be.a('function');
    });

    it('ServiceOrderWeights model getOrders method should return order', async () => {
        const serviceOrder = await factory.create('serviceOrder'),
            serviceOrderWeight = await factory.create('serviceOrderWeight', {
                serviceOrderId: serviceOrder.id,
            });
        expect((await serviceOrderWeight.getOrders()).id).to.be.eq(serviceOrder.id);
    });

    it('ServiceOrderWeights model should have getTeamMember method when created', async () => {
        const serviceOrderWeight = await factory.create('serviceOrderWeight');
        expect(serviceOrderWeight.getTeamMember).to.be.a('function');
    });

    it('ServiceOrderWeights model getTeamMember method should return teamMember', async () => {
        const teamMember = await factory.create('teamMember'),
            serviceOrderWeight = await factory.create('serviceOrderWeight', {
                teamMemberId: teamMember.id,
            });
        expect((await serviceOrderWeight.getTeamMember()).id).to.be.eq(teamMember.id);
    });
});

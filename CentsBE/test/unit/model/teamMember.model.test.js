require('../../testHelper')
const { expect } = require('../../support/chaiHelper')
const {
    hasAssociation,
    hasTable,
    belongsToOne,
    hasMany,
    hasOne,
    hasManyToMany,
} = require('../../support/objectionTestHelper')
const TeamMember = require('../../../models/teamMember');
const factory = require('../../factories');

describe('test TeamMember model', () => {
    it('should return true if order table exists', async () => {
        const hasTableName = await hasTable(TeamMember.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', async () => {
        expect(TeamMember.idColumn).to.equal('id');
    });

    it('TeamMember should have user association', () => {
        hasAssociation(TeamMember, 'user');
    });

    it('TeamMember should one user association', async () => {
        hasOne(TeamMember, 'user');
    });

    it('TeamMember should have stores association', () => {
        hasAssociation(TeamMember, 'stores');
    });

    it('TeamMember should have ManyToMany stores association', async () => {
        hasManyToMany(TeamMember, 'stores');
    });

    it('TeamMember should have activityLog association', async () => {
        hasAssociation(TeamMember, 'activityLog');
    });

    it('TeamMember should have many activityLog association', async () => {
        hasMany(TeamMember, 'activityLog');
    });

    it('TeamMember should have business association', async () => {
        hasAssociation(TeamMember, 'business');
    });

    it('TeamMember should BelongsToOneRelation business association', async () => {
        belongsToOne(TeamMember, 'business');
    });

    it('TeamMember should have routes association', async () => {
        hasAssociation(TeamMember, 'routes');
    });

    it('TeamMember should have many routes association', async () => {
        hasMany(TeamMember, 'routes');
    });

    it('TeamMember model should have getBusiness method when created', async () => {
        const teamMember = await factory.create('teamMember');
        expect(teamMember.getBusiness).to.be.a('function');
    });

    it('TeamMember model getBusiness method should return business', async () => {
        const laundromatBusiness = await factory.create('laundromatBusiness'),
            teamMember = await factory.create('teamMember', {
                businessId: laundromatBusiness.id,
            });
        expect((await teamMember.getBusiness()).id).to.be.eq(laundromatBusiness.id);
    });

    it('TeamMember model should have getUser method when created', async () => {
        const teamMember = await factory.create('teamMember');
        expect(teamMember.getUser).to.be.a('function');
    });

    it('TeamMember model getUser method should return user', async () => {
        const user = await factory.create('user'),
            teamMember = await factory.create('teamMember', {
                userId: user.id,
            });
        expect((await teamMember.getUser()).id).to.be.eq(user.id);
    });

});
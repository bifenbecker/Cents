require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

async function getToken(storeId) {
    return generateToken({ id: storeId });
}

async function createAndMapTeamMembers(numOfVariance, businessId, storeId) {
    const users = await factory.createMany('user', numOfVariance);
    const userIdMap = users.map((obj) => ({ userId: obj.id, businessId: businessId }));

    const teamMembers = await factory.createMany('teamMember', userIdMap.length, userIdMap);
    const teamMembersIdMap = teamMembers.map((obj) => ({ teamMemberId: obj.id, storeId: storeId }));

    await factory.createMany('teamMemberStore', teamMembersIdMap.length, teamMembersIdMap);

    return {
        users,
        teamMembers,
    };
}

describe('test /api/v1/employee-tab/team-members/all', () => {
    const apiEndPoint = '/api/v1/employee-tab/team-members/all';
    describe('test fetch teamMembers API status codes', () => {
        it('should throw an error if token is not sent and return a 401 status code', async () => {
            const res = await ChaiHttpRequestHelper.get(apiEndPoint).set('authtoken', '');

            res.should.have.status(401);
            expect(res.body.error).to.be.a('string');
            expect(res.body.error).to.equal('Please sign in to proceed.');
        });

        it('should return store not found error with 403 status code', async () => {
            const token = await getToken(0);
            const res = await ChaiHttpRequestHelper.get(apiEndPoint).set('authtoken', token);

            res.should.have.status(403);
            expect(res.body.error).to.be.a('string');
            expect(res.body.error).to.equal('Store not found');
        });

        it('should return a 200 status code with no error if proper token sent', async () => {
            const business = await factory.create('laundromatBusiness');
            const store = await factory.create('store', { businessId: business.id });

            const token = await getToken(store.id);
            const res = await ChaiHttpRequestHelper.get(apiEndPoint).set('authtoken', token);

            res.should.have.status(200);
            expect(res.body).to.not.have.keys('error');
        });
    });

    describe('test fetch teamMembers API return values', () => {
        let business, store, token;
        beforeEach(async () => {
            business = await factory.create('laundromatBusiness');
            store = await factory.create('store', { businessId: business.id });
            token = await getToken(store.id);
        });

        it('should return an empty array if NO team members', async () => {
            const res = await ChaiHttpRequestHelper.get(apiEndPoint).set('authtoken', token);
            const { success, teamMembers } = res.body;

            expect(success).to.be.true;
            expect(teamMembers).to.be.an('array').that.is.empty;
        });

        it('should return an array with correct team members', async () => {
            const { users, teamMembers } = await createAndMapTeamMembers(
                10,
                business.id,
                store.id,
            );

            const res = await ChaiHttpRequestHelper.get(apiEndPoint).set('authtoken', token);
            const { success, teamMembers: resTeamMembers } = res.body;

            expect(success).to.be.true;

            for (let i = 0; i < resTeamMembers.length; i++) {
                const returnedTeamMember = resTeamMembers[i];
                const teamMemberObj = teamMembers.find((obj) => obj.id === returnedTeamMember.id);

                const userObj = teamMemberObj
                    ? users.find((obj) => obj.id === teamMemberObj.userId)
                    : {};
                const userFullName = userObj ? `${userObj.firstname} ${userObj.lastname}` : '';

                expect(returnedTeamMember.id).to.equal(teamMemberObj.id);
                expect(returnedTeamMember.fullName.toLowerCase()).to.equal(
                    userFullName.toLowerCase(),
                );
            }
        });

        it('should return an array of correct length for many team members', async () => {
            const { teamMembers } = await createAndMapTeamMembers(
                10,
                business.id,
                store.id,
            );

            const res = await ChaiHttpRequestHelper.get(apiEndPoint).set('authtoken', token);
            const { success, teamMembers: resTeamMembers } = res.body;

            expect(success).to.be.true;
            expect(resTeamMembers.length).to.equal(teamMembers.length);
        });
    });
});

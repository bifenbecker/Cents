require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect, assert } = require('../../../support/chaiHelper');

describe('test checkedInEmployees api', () => {
    let business, store, token;
    const apiEndPoint = '/api/v1/employee-tab/home/checked-in-employees';

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', {
            businessId: business.id,
        });
        token = generateToken({
            id: store.id,
        });
    });

    it('should return status 200 and checked in users', async () => {
        await factory.create('role', { userType: 'Business Owner' });
        const user = await factory.create('userWithBusinessOwnerRole');
        const teamMember = await factory.create('teamMember', {
            businessId: business.id,
            userId: user.id,
        });
        const teamMemberCheckIn = await factory.create('teamMemberCheckIn', {
            teamMemberId: teamMember.id,
            storeId: store.id,
            isCheckedIn: true,
            checkInTime: new Date('4-5-2022').toISOString(),
            checkOutTime: new Date('4-7-2022').toISOString(),
        });
        const res = await ChaiHttpRequestHelper.get(apiEndPoint).set('authtoken', token);

        res.should.have.status(200);
        assert.equal(res.body.employees[0].employeeCode, teamMember.employeeCode);
        expect(res.body.employees[0].checkInId).to.equal(teamMemberCheckIn.id);
        expect(res.body.success).to.equal(true);
    });

    it('should return status 200 and empty users array', async () => {
        await factory.create('role', { userType: 'Business Owner' });
        const user = await factory.create('userWithBusinessOwnerRole');
        factory.create('teamMember', {
            businessId: business.id,
            userId: user.id,
        });
        const res = await ChaiHttpRequestHelper.get(apiEndPoint).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.employees.length).to.equal(0);
        expect(res.body.success).to.equal(true);
    });

    it('should fail if auth token is absent', async () => {
        const res = await ChaiHttpRequestHelper.get(apiEndPoint);

        res.should.have.status(401);
        expect(res.body.error).to.equal('Please sign in to proceed.');
    });
});

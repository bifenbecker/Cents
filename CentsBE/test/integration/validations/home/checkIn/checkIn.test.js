require('./../../../../testHelper');
const ChaiHttpRequestHelper = require('./../../../../support/chaiHttpRequestHelper');
const { generateToken } = require('./../../../../support/apiTestHelper');
const factory = require('./../../../../factories');
const { expect } = require('./../../../../support/chaiHelper');

describe('test checkInValidations validation', () => {
    const apiEndPoint = '/api/v1/employee-tab/home/check-in';
    let business, store, token;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', {
            businessId: business.id,
        });
        token = generateToken({
            id: store.id,
        });
    });

    it('should throw an error if employeeCode is absent in request body', async () => {
        const body = {};
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

        res.should.have.status(422);
        expect(res.body.error).to.equal('"employeeCode" is required');
    });

    it('should throw an error if an employee is already checked in another store', async () => {
        await factory.create('role', { userType: 'Business Owner' });
        const user = await factory.create('userWithBusinessOwnerRole');
        const teamMember = await factory.create('teamMember', {
            businessId: business.id,
            userId: user.id,
        });
        const anotherBusiness = await factory.create('laundromatBusiness');
        const anotherStore = await factory.create('store', {
            businessId: anotherBusiness.id,
        });
        await factory.create('teamMemberCheckIn', {
            teamMemberId: teamMember.id,
            storeId: anotherStore.id,
            isCheckedIn: true,
            checkInTime: new Date('4-5-2022').toISOString(),
            checkOutTime: new Date('4-7-2022').toISOString(),
        });

        const body = { employeeCode: teamMember.employeeCode };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

        res.should.have.status(409);
        expect(res.body.error).to
            .equal(`You are already checked in at another store. Please check out from the last
                     store where you had checked-in`);
    });

    it('should go next if data is correct', async () => {
        await factory.create('role', { userType: 'Business Owner' });
        const user = await factory.create('userWithBusinessOwnerRole');
        const teamMember = await factory.create('teamMember', {
            businessId: business.id,
            userId: user.id,
        });
        const body = { employeeCode: teamMember.employeeCode };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

        res.should.have.status(200);
    });
});

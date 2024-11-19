require('./../../../../testHelper');
const ChaiHttpRequestHelper = require('./../../../../support/chaiHttpRequestHelper');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { generateToken } = require('./../../../../support/apiTestHelper');
const factory = require('./../../../../factories');
const validateRequest = require('../../../../../validations/employeeTab/home/checkIn/checkOut.js');
const { expect } = require('./../../../../support/chaiHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../../support/mockers/createMiddlewareMockedArgs');

describe('test checkOut validation', () => {
    const apiEndPoint = '/api/v1/employee-tab/home/check-out';
    let business, store, token;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
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
        expect(res.body.error).to.equal(
            'child "employeeCode" fails because ["employeeCode" is required]',
        );
    });

    it('should throw an error if employeeCode is invalid', async () => {
        const body = { employeeCode: 123 };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

        res.should.have.status(400);
        expect(res.body.error).to.equal('Invalid employee code');
    });

    it('should throw an error if the user is not associated with the current store', async () => {
        const user = await factory.create(FACTORIES_NAMES.user);
        const role = await factory.create(FACTORIES_NAMES.role, { userType: 'user' });
        await factory.create(FACTORIES_NAMES.userRole, {
            userId: user.id,
            roleId: role.id,
        });
        const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
            businessId: business.id,
            userId: user.id,
        });
        const body = { employeeCode: teamMember.employeeCode };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

        res.should.have.status(400);
        expect(res.body.error).to.equal('You are not authorized to check-out in at this store.');
    });

    it('should throw an error if the user is already checked in', async () => {
        const user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
            businessId: business.id,
            userId: user.id,
        });
        const body = { employeeCode: teamMember.employeeCode };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);

        res.should.have.status(409);
        expect(res.body.error).to.equal('You are not checked in.');
    });

    it('should call next() if data is correct', async () => {
        const user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
            businessId: business.id,
            userId: user.id,
        });
        await factory.create(FACTORIES_NAMES.teamMemberCheckIn, {
            teamMemberId: teamMember.id,
            storeId: store.id,
            isCheckedIn: true,
            checkInTime: new Date().toISOString(),
            checkOutTime: new Date().toISOString(),
        });

        const req = {
            body: { employeeCode: teamMember.employeeCode },
            currentStore: { businessId: business.id, id: store.id },
        };
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await validateRequest(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next()').to.be.true;
        expect(mockedReq.teamMemberId).to.be.equal(teamMember.id);
        expect(mockedReq.businessId).to.be.equal(business.id);
        expect(mockedReq.previousStoreId).to.be.equal(store.id);
        expect(mockedReq.userId).to.be.equal(user.id);
    });

    it('should call next(error) if currentStore arguments are absent', async () => {
        const user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
            businessId: business.id,
            userId: user.id,
        });
        await factory.create(FACTORIES_NAMES.teamMemberCheckIn, {
            teamMemberId: teamMember.id,
            storeId: store.id,
            isCheckedIn: true,
            checkInTime: new Date().toISOString(),
            checkOutTime: new Date().toISOString(),
        });

        const req = {
            body: { employeeCode: teamMember.employeeCode },
        };

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await validateRequest(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).to.not.be.empty;
    });
});

require('../../../testHelper');
const {
    assertPostResponseError,
    assertPostResponseSuccess,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');

const { expect } = require('../../../support/chaiHelper');
const TeamMembersCheckIn = require('../../../../models/teamMemberCheckIn');
const { USER_TYPES } = require('../../../../constants/constants');

const assertSuccessfullCheckIn = async ({ response, teamMemberId, store, user }) => {
    const teamMembersCheckIn = await TeamMembersCheckIn.query().findOne({
        teamMemberId,
    });

    expect(response.body.success).to.equal(true);
    expect(response.body.storeId).to.equal(store.id);
    expect(response.body.fullName).to.equal(`${user.firstname} ${user.lastname}`);
    expect(response.body.isCheckedIn).to.equal(teamMembersCheckIn.isCheckedIn);
};

describe('test checkIn api', () => {
    let business, store, token;
    const apiEndPoint = '/api/v1/employee-tab/home/check-in';

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        token = generateToken({
            id: store.id,
        });
    });

    itShouldCorrectlyAssertTokenPresense(assertPostResponseError, () => apiEndPoint);

    it('should allow owner to checkIn', async () => {
        await factory.create(FACTORIES_NAMES.role, { userType: USER_TYPES.BUSINESS_OWNER });
        const user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
            businessId: business.id,
            userId: user.id,
        });
        const body = { employeeCode: teamMember.employeeCode };
        const response = await assertPostResponseSuccess({
            url: apiEndPoint,
            body,
            token,
        });

        await assertSuccessfullCheckIn({
            response,
            teamMemberId: teamMember.id,
            store,
            user,
        });
    });

    it('should allow employee associated with store to checkIn', async () => {
        const user = await factory.create(FACTORIES_NAMES.user);
        await factory.create(FACTORIES_NAMES.userRole, {
            userId: user.id,
            roleId: factory.assoc(FACTORIES_NAMES.role, 'id', {
                userType: USER_TYPES.EMPLOYEE,
            }),
        });
        const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
            userId: user.id,
            businessId: business.id,
        });
        await factory.create(FACTORIES_NAMES.teamMemberStore, {
            teamMemberId: teamMember.id,
            storeId: store.id,
        });

        const body = { employeeCode: teamMember.employeeCode };
        const response = await assertPostResponseSuccess({
            url: apiEndPoint,
            body,
            token,
        });

        await assertSuccessfullCheckIn({
            response,
            teamMemberId: teamMember.id,
            store,
            user,
        });
    });

    it('should forbid archived employee associated with store to checkIn', async () => {
        const user = await factory.create(FACTORIES_NAMES.user);
        await factory.create(FACTORIES_NAMES.userRole, {
            userId: user.id,
            roleId: factory.assoc(FACTORIES_NAMES.role, 'id', {
                userType: USER_TYPES.EMPLOYEE,
            }),
        });
        const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
            userId: user.id,
            businessId: business.id,
            isDeleted: true,
            deletedAt: new Date('07-17-2022').toISOString(),
        });
        await factory.create(FACTORIES_NAMES.teamMemberStore, {
            teamMemberId: teamMember.id,
            storeId: store.id,
        });

        const body = { employeeCode: teamMember.employeeCode };
        await assertPostResponseError({
            url: apiEndPoint,
            body,
            token,
            code: 403,
            expectedError: 'User not found',
        });
    });
});

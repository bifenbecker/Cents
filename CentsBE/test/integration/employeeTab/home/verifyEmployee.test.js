require('../../../testHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { generateToken } = require('../../../support/apiTestHelper');
const {
    assertPostResponseError,
    assertPostResponseSuccess,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const { expect } = require('chai');

const apiEndPoint = '/api/v1/employee-tab/home/verify-employee';

describe('test verifyEmployee api', () => {
    let store, token, teamMember;

    beforeEach(async () => {
        store = await factory.create(FACTORIES_NAMES.store);
        teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
            businessId: store.businessId,
        });
        token = generateToken({
            id: store.id,
        });
    });

    itShouldCorrectlyAssertTokenPresense(assertPostResponseError, () => apiEndPoint);

    it('should fail if employee was not found', async () => {
        await assertPostResponseError({
            url: apiEndPoint,
            body: {
                employeeCode: -1,
            },
            token,
            code: 500,
            expectedError: 'Invalid employee code',
        });
    });

    it('should fail if employee is not authorized to use this store', async () => {
        const role = await factory.create(FACTORIES_NAMES.role, {
            userType: 'Business Manager',
        });
        await factory.create(FACTORIES_NAMES.userRole, {
            userId: teamMember.userId,
            roleId: role.id,
        });

        await assertPostResponseError({
            url: apiEndPoint,
            body: {
                employeeCode: teamMember.employeeCode,
            },
            token,
            code: 500,
            expectedError: 'You are not authorized to check-in in at this store.',
        });
    });

    it('should fail if employee is not checked in', async () => {
        await factory.create(FACTORIES_NAMES.teamMemberStore, {
            teamMemberId: teamMember.id,
            storeId: store.id,
        });

        await assertPostResponseError({
            url: apiEndPoint,
            body: {
                employeeCode: teamMember.employeeCode,
            },
            token,
            code: 400,
            expectedError: 'Please check-in to continue.',
        });
    });

    it('should pass validation', async () => {
        await factory.create(FACTORIES_NAMES.teamMemberStore, {
            teamMemberId: teamMember.id,
            storeId: store.id,
        });
        await factory.create(FACTORIES_NAMES.teamMemberCheckIn, {
            teamMemberId: teamMember.id,
            storeId: store.id,
            isCheckedIn: true,
        });

        const response = await assertPostResponseSuccess({
            url: apiEndPoint,
            body: {
                employeeCode: teamMember.employeeCode,
            },
            token,
        });
        expect(response.body.success).to.be.true;
    });
});

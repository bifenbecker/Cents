require('../../../../../testHelper');
const factory = require('../../../../../factories');
const { FACTORIES_NAMES } = require('../../../../../constants/factoriesNames');
const { generateToken } = require('../../../../../support/apiTestHelper');
const {
    assertPostResponseError,
    assertPostResponseSuccess,
} = require('../../../../../support/httpRequestsHelper');

const apiEndPoint = '/api/v1/employee-tab/home/verify-employee';

describe('test verifyEmployee validation', () => {
    let store, token;

    beforeEach(async () => {
        store = await factory.create(FACTORIES_NAMES.store);
        token = generateToken({
            id: store.id,
        });
    });

    it('should fail if employeeCode is not provided', async () => {
        await assertPostResponseError({
            url: apiEndPoint,
            body: {},
            token,
            code: 422,
            expectedError: '"employeeCode" is required',
        });
    });

    it('should fail if employeeCode is not a number', async () => {
        await assertPostResponseError({
            url: apiEndPoint,
            body: {
                employeeCode: '1-2-3',
            },
            token,
            code: 422,
            expectedError: '"employeeCode" must be a number',
        });
    });

    it('should fail if employeeCode is not an integer', async () => {
        await assertPostResponseError({
            url: apiEndPoint,
            body: {
                employeeCode: 1.23,
            },
            token,
            code: 422,
            expectedError: '"employeeCode" must be an integer',
        });
    });

    it('should fail if employee was not found', async () => {
        await assertPostResponseError({
            url: apiEndPoint,
            body: {
                employeeCode: -1,
            },
            token,
            code: 500,
        });
    });

    it('should pass validation', async () => {
        const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
            businessId: store.businessId,
        });
        await factory.create(FACTORIES_NAMES.teamMemberStore, {
            teamMemberId: teamMember.id,
            storeId: store.id,
        });
        await factory.create(FACTORIES_NAMES.teamMemberCheckIn, {
            teamMemberId: teamMember.id,
            storeId: store.id,
            isCheckedIn: true,
        });

        await assertPostResponseSuccess({
            url: apiEndPoint,
            body: {
                employeeCode: teamMember.employeeCode,
            },
            token,
        });
    });
});

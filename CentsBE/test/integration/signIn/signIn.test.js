require('../../testHelper');

const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const factory = require('../../factories');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');
const { USER_TYPES, userRoles } = require('../../../constants/constants');

const { expect } = require('../../support/chaiHelper');
const { assertPostResponseError, assertPostResponseSuccess } = require('../../support/httpRequestsHelper');
const generateIntercomHash = require('../../../utils/generateIntercomHash');

const url = '/api/v1/sign-in';
const email = 'user@email.com';
const password = 's0m3-p@$$w0rd';

const setupTestData = async ({
    userType, 
    teamMemberData
}) => {
    const user = await factory.create(FACTORIES_NAMES.user, { 
        email, 
        password: await argon2.hash(password)
    });
    const role = await factory.create(FACTORIES_NAMES.role, { userType });
    await factory.create(FACTORIES_NAMES.userRole, {
        userId: user.id,
        roleId: role.id,
    });

    const laundromatBusiness = await factory.create(
        FACTORIES_NAMES.laundromatBusiness,
        USER_TYPES.BUSINESS_OWNER 
            ? {userId: user.id}
            : {}
    );

    const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
        ...teamMemberData,
        businessId: laundromatBusiness.id,
        userId: user.id,
    });

    return { user, role, teamMember, laundromatBusiness };
};

const assertSuccessfullResponseBody = ({response, user, userType, role, teamMember, laundromatBusiness}) => {
    const intercomHash = generateIntercomHash(user.uuid);

    expect(response).to.have.property('body');
    expect(response.body).to.be.eql({
        success: true,
        user: {
            intercomHash,
            userId: user.id,
            firstName: user.firstname,
            lastName: user.lastname,
            email: user.email,
            isGlobalVerified: user.isGlobalVerified,
            uuid: user.uuid,
            teamMemberId: teamMember.id,
            roleId: role.id,
            roleName: userRoles[userType],
            token: response.body.user.token,
        },
        business: {
            id: teamMember.businessId,
            name: laundromatBusiness.name,
            uuid: laundromatBusiness.uuid,
        },
    });

    const decodedToken = jwt.verify(response.body.user.token, process.env.JWT_SECRET_TOKEN);
    expect(decodedToken).to.have.property('id', user.id);
    expect(decodedToken).to.have.property('teamMemberId', teamMember.id);
    expect(decodedToken).to.have.property('role', role.id);
    expect(decodedToken).to.have.property('iat');
};

describe('test /api/v1/sign-in endpoint', () => {
    it('should prevent user from login if email is not found', async () => {
        await setupTestData({
            userType: USER_TYPES.BUSINESS_ADMIN,
        });

        await assertPostResponseError({
            url,
            body: { 
                username: `unknown${email}`, 
                password 
            },
            code: 403,
            expectedError: 'The user matching the provided email and password does not exist.',
        });
    });

    it('should forbit archived teamMembers login', async () => {
        await setupTestData({
            userType: USER_TYPES.BUSINESS_ADMIN,
            teamMemberData: {
                isDeleted: true,
                deletedAt: new Date('07-17-2022').toISOString(),
            }
        });

        await assertPostResponseError({
            url,
            body: { 
                username: email, 
                password 
            },
            code: 403,
            expectedError: 'The user matching the provided email and password does not exist.',
        });
    });

    describe('with invalid credentials', () => {
        beforeEach(async () => {
            await setupTestData({
                userType: USER_TYPES.BUSINESS_ADMIN,
            });
        });

        it('should prevent sign-in if invalid credentials', async () => {
            await assertPostResponseError({
                url,
                body: { 
                    username: email, 
                    password: `invalid-${password}-invalid`
                },
                code: 403,
                expectedError: 'Invalid credentials.',
            });
        });
    });


    describe('with incorrect input', () => {
        it('should prevent sign-in if username is missed', async () => {
            await assertPostResponseError({
                url,
                body: { password },
                code: 422,
                expectedError: '"email" is required',
            });
        });

        it('should prevent sign-in if username is incorrect email', async () => {
            await assertPostResponseError({
                url,
                body: { 
                    username: '@@@@', 
                    password 
                },
                code: 422,
                expectedError: '"email" must be a valid email',
            });
        });

        it('should prevent sign-in if password is missed', async () => {
            await assertPostResponseError({
                url,
                body: { username: email },
                code: 422,
                expectedError: '"password" is required',
            });
        });

        it('should prevent sign-in if password is not a string', async () => {
            await assertPostResponseError({
                url,
                body: { 
                    username: email, 
                    password: 123 
                },
                code: 422,
                expectedError: '"password" must be a string',
            });
        });
    });

    describe('test forbidden roles', () => {
        const itShouldPreventLoginOfUserWithRole = (userType) => {
            it(`should prevent ${userType} from login`, async () => {
                await setupTestData({
                    userType,
                });

                await assertPostResponseError({
                    url,
                    body: { 
                        username: email, 
                        password 
                    },
                    code: 403,
                    expectedError: 'Invalid credentials.',
                });
            });
        };

        itShouldPreventLoginOfUserWithRole(USER_TYPES.CUSTOMER);

        itShouldPreventLoginOfUserWithRole(USER_TYPES.EMPLOYEE);
    });

    describe('test allowed roles', () => {
        const itAllowLoginOfUserWithRole = (userType) => {
            it(`should allow ${userType} to login`, async () => {
                const { user, role, teamMember, laundromatBusiness } = await setupTestData({
                    userType,
                });

                const response = await assertPostResponseSuccess({
                    url,
                    body: { 
                        username: email, 
                        password 
                    },
                });

                assertSuccessfullResponseBody({
                    response,
                    user,
                    userType,
                    role,
                    teamMember,
                    laundromatBusiness,
                }); 
            });
        };

        itAllowLoginOfUserWithRole(USER_TYPES.BUSINESS_OWNER);

        itAllowLoginOfUserWithRole(USER_TYPES.BUSINESS_ADMIN);

        itAllowLoginOfUserWithRole(USER_TYPES.BUSINESS_MANAGER);
    });
});

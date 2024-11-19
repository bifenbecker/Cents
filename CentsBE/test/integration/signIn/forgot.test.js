require('../../testHelper');
const User = require('../../../models/user');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');
const { expect } = require('../../support/chaiHelper');
const { assertPostResponseError, assertPostResponseSuccess } = require('../../support/httpRequestsHelper');
const { USER_TYPES } = require('../../../constants/constants');
const factory = require('../../factories');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const eventEmitter = require('../../../config/eventEmitter');
const sinon = require('sinon');

const url = '/api/v1/sign-in/forgot';
const email = 'user@gmail.com';
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

const fetchUser = (userId) => {
    return User.query().findById(userId)
}

const assertSuccessfullResponseBody = async ({response, userId}) => {
    const eventEmitterSpy = sinon.spy(eventEmitter, 'emit');

    const user = await fetchUser(userId)
    expect(response).to.have.property('body');
    expect(response.body).to.be.eql({
        success: true,
    });

    const decodedToken = jwt.verify(user.resetPasswordToken, process.env.JWT_SECRET_TOKEN);
    expect(decodedToken).to.have.property('email', 'user@gmail.com');
    expect(eventEmitterSpy.calledWith('emailNotification', user));
    expect(eventEmitterSpy.calledOnce).to.be.true;
};

describe('test forgot password', () => { 
    describe('test req body validations', () => {
        it('should throw error saying email is required', async () => {
            await assertPostResponseError({
                url,
                body: { },
                code: 422,
                expectedError: '"email" is required',
            });
        });

        it('should throw an error saying email should be valid', async () => {
            await assertPostResponseError({
                url,
                body: {
                    email: 'abcd'
                },
                code: 422,
                expectedError: '"email" must be a valid email',
            });
        })
    })

    describe('with valid input', () => {
        let userId
        beforeEach(async () => {
            const {user} = await setupTestData({
                userType: USER_TYPES.BUSINESS_ADMIN,
            });
            userId = user.id
        })
        it('should throw an error if user not found', async () => {
            await assertPostResponseError({
                url,
                body: {
                    email: 'abcd@gmail.com'
                },
                code: 400,
                expectedError: 'User not found.',
            });
        })

        it('should find the user and update the resetPasswordToken', async () => {
            const response = await assertPostResponseSuccess({
                url,
                body: {
                    email: 'User@gmail.com'
                },
            });
            assertSuccessfullResponseBody({
                response,
                userId,
            }); 
        })

        it('should find the user and update the resetPasswordToken', async () => {
            const response = await assertPostResponseSuccess({
                url,
                body: {
                    email: 'user@gmail.com'
                },
            });
            assertSuccessfullResponseBody({
                response,
                userId,
            }); 
        })

        it('should throw an error "User not found" if similar email is given', async () => {
            await assertPostResponseError({
                url,
                body: {
                    email: 'user1@gmail.com'
                },
                code: 400,
                expectedError: 'User not found.',
            });
        });
    })
})
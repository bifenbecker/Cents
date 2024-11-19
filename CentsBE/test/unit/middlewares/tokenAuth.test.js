require('../../testHelper');
const moment = require('moment');

const { expect } = require('../../support/chaiHelper');
const { generateToken } = require('../../support/apiTestHelper');
const { createMiddlewareMockedArgs } = require('../../support/mockers/createMiddlewareMockedArgs');
const factory = require('../../factories');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');

const tokenAuth = require('../../../middlewares/tokenAuth');

const setupTest = async (teamMemberData, userData) => {
    const user = await factory.create(FACTORIES_NAMES.user, userData);

    const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
        ...teamMemberData,
        userId: user.id
    });

    const token = generateToken({
        id: teamMember.userId
    });

    return { token };
};

describe('test tokenAuth', () => {
    it('should succesfully validate existing active user', async () => {
        const { token } = await setupTest();

        const { mockedReq, mockedRes, mockedNext, expectedNextCall } = createMiddlewareMockedArgs({
            headers: {
                authtoken: token
            }
        });
        await tokenAuth(mockedReq, mockedRes, mockedNext);

        expectedNextCall();
    });

    it('should prevent invalid token', async () => {
        const { mockedReq, mockedRes, mockedNext, expectedNextCall } = createMiddlewareMockedArgs({
            headers: {
                authtoken: 123
            }
        });
        await tokenAuth(mockedReq, mockedRes, mockedNext);

        expectedNextCall(error => {
            expect(error.message).to.contain('jwt must be a string');
        });
    });

    it('should require sign-in if request does not contain token', async () => {
        const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs({
            headers: { }
        });
        await tokenAuth(mockedReq, mockedRes, mockedNext);

        expectedResponseCall(401, response => {
            expect(response).to.have.property('error', 'Please sign in to proceed.')
        });
    });

    it('should require sign-in if password is reset after token issue', async () => {
        const { token } = await setupTest({
             isDeleted: false 
        }, {
            passwordResetDate: moment().add(1, 'day').toString()
        });

        const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs({
            headers: {
                authtoken: token
            }
        });
        await tokenAuth(mockedReq, mockedRes, mockedNext);

        expectedResponseCall(401, response => {
            expect(response).to.have.property('error', 'Please sign in to proceed.')
        });
    });

    it('should pass error to next if unexpected error occures (request missing headers property)', async () => {
        const { mockedReq, mockedRes, mockedNext, expectedNextCall } = createMiddlewareMockedArgs({});
        await tokenAuth(mockedReq, mockedRes, mockedNext);

        expectedNextCall(error => {
            expect(error.message).to.contain('property \'authtoken\' of undefined');
        });
    });

    describe('test active/archived teamMembers auth', async () => {
        it('should succesfully validate existing non-archived teamMember', async () => {
            const { token } = await setupTest({ isDeleted: false });
    
            const { mockedReq, mockedRes, mockedNext, expectedNextCall } = createMiddlewareMockedArgs({
                headers: {
                    authtoken: token
                }
            });
            await tokenAuth(mockedReq, mockedRes, mockedNext);

            expectedNextCall();
        });
    
        it('should prevent archived teamMember login', async () => {
            const { token } = await setupTest({ isDeleted: true });
    
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs({
                headers: {
                    authtoken: token
                }
            });
            await tokenAuth(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(403, response => {
                expect(response).to.have.property('error', 'User not found')
            });
        });
    });
});
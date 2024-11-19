require('../../testHelper');

const factory = require('../../factories');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');
const { generateToken } = require('../../support/apiTestHelper');
const { expect } = require('../../support/chaiHelper');
const { createMiddlewareMockedArgs } = require('../../support/mockers/createMiddlewareMockedArgs');

const driverAppAuth = require('../../../middlewares/driverAppAuth');

const setupTest = async (teamMemberData) => {
    const teamMember = await factory.create(FACTORIES_NAMES.teamMember, teamMemberData);

    const token = generateToken({
        id: teamMember.userId
    });

    return { token };
};

describe('test driverAppAuth', () => {
    it('should succesfully validate existing active driver app user', async () => {
        const { token } = await setupTest();

        const { mockedReq, mockedRes, mockedNext, expectedNextCall } = createMiddlewareMockedArgs({
            headers: {
                authtoken: token
            }
        });
        await driverAppAuth(mockedReq, mockedRes, mockedNext);

        expectedNextCall();
    });

    it('should prevent invalid token', async () => {
        const { mockedReq, mockedRes, mockedNext, expectedNextCall } = createMiddlewareMockedArgs({
            headers: {
                authtoken: 123
            }
        });
        await driverAppAuth(mockedReq, mockedRes, mockedNext);

        expectedNextCall(error => {
            expect(error.message).to.contain('jwt must be a string');
        });
    });


    it('should pass error to next if unexpected error occures (request missing headers property)', async () => {
        const { mockedReq, mockedRes, mockedNext, expectedNextCall } = createMiddlewareMockedArgs({});
        await driverAppAuth(mockedReq, mockedRes, mockedNext);

        expectedNextCall(error => {
            expect(error.message).to.contain('property \'authtoken\' of');
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
            await driverAppAuth(mockedReq, mockedRes, mockedNext);

            expectedNextCall();
        });
    
        it('should prevent archived teamMember login', async () => {
            const { token } = await setupTest({ isDeleted: true });
    
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs({
                headers: {
                    authtoken: token
                }
            });
            await driverAppAuth(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(403, response => {
                expect(response).to.have.property('error', 'User not found')
            });
        });
    });
});
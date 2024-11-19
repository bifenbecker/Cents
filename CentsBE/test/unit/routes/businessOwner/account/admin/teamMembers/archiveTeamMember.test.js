require('../../../../../../testHelper');

const { expect } = require('../../../../../../support/chaiHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../../../../support/mockers/createMiddlewareMockedArgs');
const {
    validateArchiveTeamMemberInput,
    archiveTeamMember,
} = require('../../../../../../../routes/businessOwner/admin/teamMembers/archiveTeamMember');

describe('test validateArchiveTeamMemberInput method', () => {
    it('should pass correct input values', async () => {
        const params = { teamMemberId: 1 };
        const body = { archiveBoolean: true };
        const { mockedReq, mockedRes, mockedNext, expectedNextCall } = createMiddlewareMockedArgs({
            params,
            body,
        });

        await validateArchiveTeamMemberInput(mockedReq, mockedRes, mockedNext);
        expectedNextCall();
    });

    it('should prevent incorrect teamMemberId values', async () => {
        const params = { teamMemberId: 'not-an-integer' };
        const body = { archiveBoolean: true };

        const { mockedReq, mockedRes, mockedNext, expectedResponseCall } =
            createMiddlewareMockedArgs({
                params,
                body,
            });
        await validateArchiveTeamMemberInput(mockedReq, mockedRes, mockedNext);

        expectedResponseCall(422, (response) => {
            expect(response).to.be.eql({ error: '"teamMemberId" must be an integer' });
        });
    });

    it('should prevent incorrect archiveBoolean values', async () => {
        const params = { teamMemberId: 1 };
        const body = { archiveBoolean: 'not-a-boolean' };

        const { mockedReq, mockedRes, mockedNext, expectedResponseCall } =
            createMiddlewareMockedArgs({
                params,
                body,
            });
        await validateArchiveTeamMemberInput(mockedReq, mockedRes, mockedNext);

        expectedResponseCall(422, (response) => {
            expect(response).to.be.eql({ error: 'only true is allowed for "archiveBoolean"' });
        });
    });

    it('should call next with error for unforseen problems (req.params is missing)', async () => {
        const body = { archiveBoolean: true };

        const { mockedReq, mockedRes, mockedNext, expectedNextCall } = createMiddlewareMockedArgs({
            body,
        });
        await validateArchiveTeamMemberInput(mockedReq, mockedRes, mockedNext);

        expectedNextCall((actualError) => {
            expect(actualError.message).to.contain("property 'teamMemberId' of");
        });
    });
});

describe('test archiveTeamMember method', () => {
    it('should call next with error for unforseen problems (req.params is missing)', async () => {
        const body = {
            archiveBoolean: true,
        };

        const { mockedReq, mockedRes, mockedNext, expectedNextCall } = createMiddlewareMockedArgs({
            body,
        });
        await archiveTeamMember(
            {
                ...mockedReq,
                currentUser: { role: 'Super Admin' },
            },
            mockedRes,
            mockedNext,
        );

        expectedNextCall((actualError) => {
            expect(actualError.message).to.contain("property 'teamMemberId' of");
        });
    });
});

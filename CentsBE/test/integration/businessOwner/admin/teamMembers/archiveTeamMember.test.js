require('../../../../testHelper');
const faker = require('faker');
const {
    assertPutResponseError,
    assertPutResponseSuccess,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../../support/httpRequestsHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { routeStatuses } = require('../../../../../constants/constants');
const { expect } = require('../../../../support/chaiHelper');

const TeamMember = require('../../../../../models/teamMember');
const TeamMemberCheckIn = require('../../../../../models/teamMemberCheckIn');
const User = require('../../../../../models/user');
const { MAX_EMAIL_LENGTH } = require('../../../../../constants/validation');
const { ARCHIVED_USER_EMAIL_PREFIX } = require('../../../../../constants/constants');
const Route = require('../../../../../models/route');

const getApiEndpoint = (teamMemberId) =>
    `/api/v1/business-owner/admin/team/archive/${teamMemberId}`;

const assertArchivatedEmailPrefix = async (teamMember, initialEmail) => {
    const user = await User.query().findById(teamMember.userId);

    const expectedEmail = `${ARCHIVED_USER_EMAIL_PREFIX}${user.id}@${initialEmail}`.substring(
        0,
        MAX_EMAIL_LENGTH,
    );
    expect(user.email).to.be.equal(expectedEmail);
};

const assertTeamMemberArchivation = async ({ teamMember, response, isDeleted, initialEmail }) => {
    expect(response.body).to.have.all.keys('success');

    const archivedTeamMember = await TeamMember.query().findById(teamMember.id);
    expect(archivedTeamMember).to.have.property('isDeleted', isDeleted);
    if (isDeleted) {
        expect(archivedTeamMember.deletedAt).to.be.a.dateString();

        const teamMemberCheckIn = await TeamMemberCheckIn.query().findOne({
            teamMemberId: teamMember.id,
        });
        expect(teamMemberCheckIn).to.be.an('object');
        expect(teamMemberCheckIn.isCheckedIn).to.be.false;

        await assertArchivatedEmailPrefix(teamMember, initialEmail);
    }
};

const setupTestData = async ({ teamMemberData, teamMemberCheckInData, initialEmail }) => {
    const user = await factory.create(FACTORIES_NAMES.user);
    await User.query().findById(user.id).patch({ email: initialEmail });
    const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
        ...teamMemberData,
        userId: user.id,
    });
    const role = await factory.create(FACTORIES_NAMES.role);
    await factory.create(FACTORIES_NAMES.route, {
        driverId: teamMember.id,
        status: routeStatuses.COMPLETED,
    });
    await factory.create(FACTORIES_NAMES.userRole, {
        userId: user.id,
        roleId: role.id,
    });
    const teamMemberCheckIn = await factory.create(FACTORIES_NAMES.teamMemberCheckIn, {
        ...teamMemberCheckInData,
        teamMemberId: teamMember.id,
    });
    return {
        teamMember,
        teamMemberCheckIn,
    };
};

describe(`test ${getApiEndpoint(':teamMemberId')} endpoint`, () => {
    let token;

    beforeEach(async () => {
        const user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        await factory.create(FACTORIES_NAMES.teamMember, { userId: user.id });
        token = generateToken({
            id: user.id,
        });
    });

    itShouldCorrectlyAssertTokenPresense(assertPutResponseError, () => getApiEndpoint(1));

    it('should successfully archive teamMember', async () => {
        const isDeleted = true;
        const initialEmail = 'user@email.com';
        const { teamMember } = await setupTestData({
            teamMemberData: {
                isDeleted: false,
            },
            initialEmail,
        });

        const response = await assertPutResponseSuccess({
            url: getApiEndpoint(teamMember.id),
            token,
            body: {
                archiveBoolean: isDeleted,
            },
        });

        await assertTeamMemberArchivation({
            teamMember,
            response,
            isDeleted,
            initialEmail,
        });
    });

    it('should successfully archive teamMember with long email', async () => {
        const isDeleted = true;
        const initialEmail = faker.random.alphaNumeric(245) + '@email.com';
        const { teamMember } = await setupTestData({
            teamMemberData: {
                isDeleted: false,
            },
            initialEmail,
        });

        const response = await assertPutResponseSuccess({
            url: getApiEndpoint(teamMember.id),
            token,
            body: {
                archiveBoolean: isDeleted,
            },
        });

        await assertTeamMemberArchivation({
            teamMember,
            response,
            isDeleted,
            initialEmail,
        });
    });

    it('should prevent unarchive teamMember', async () => {
        const isDeleted = false;
        const { teamMember } = await setupTestData({
            teamMemberData: {
                isDeleted: true,
                deletedAt: new Date('07-17-2022').toISOString(),
            },
        });

        await assertPutResponseError({
            url: getApiEndpoint(teamMember.id),
            token,
            body: {
                archiveBoolean: isDeleted,
            },
            code: 422,
            expectedError: 'only true is allowed for "archiveBoolean"',
        });
    });

    describe('check validations', () => {
        it('should reject with 422 if teamMemberId is not an integer', async () => {
            const isDeleted = false;
            await assertPutResponseError({
                url: getApiEndpoint('teamMemberId-is-not-an-integer'),
                token,
                body: {
                    archiveBoolean: isDeleted,
                },
                code: 422,
                expectedError: '"teamMemberId" must be an integer',
            });
        });

        it('should reject with 422 if archiveBoolean is not true', async () => {
            await assertPutResponseError({
                url: getApiEndpoint(1),
                token,
                body: {
                    archiveBoolean: 'not-a-boolean',
                },
                code: 422,
                expectedError: 'only true is allowed for "archiveBoolean"',
            });
        });
    });
});

require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const validateArchivedTeamMemberUow = require('../../../../uow/archive/validateArchivedTeamMemberUow');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');

describe('validateArchivedTeamMemberUow test', function () {
    let teamMember;
    beforeEach(async () => {
        teamMember = await factory.create(FACTORIES_NAMES.teamMember);
    });

    it('should throw error if invalid payload passed', async () => {
        await expect(validateArchivedTeamMemberUow()).to.be.rejected;
        await expect(validateArchivedTeamMemberUow({})).to.be.rejected;
        await expect(validateArchivedTeamMemberUow(null)).to.be.rejected;
    });

    it('should throw error if invalid modelId provided', async () => {
        const payload = {
            modelId: -1234,
            archiveBoolean: true,
        };

        await expect(validateArchivedTeamMemberUow(payload, () => {})).to.be.rejectedWith(
            `Team member with id=${payload.modelId} does not exist.`,
        );
    });

    it('should throw error if you want to archive employee who already archived', async () => {
        teamMember = await factory.create(FACTORIES_NAMES.teamMember, { isDeleted: true });
        const payload = {
            modelId: teamMember.id,
            archiveBoolean: true,
        };

        await expect(validateArchivedTeamMemberUow(payload, () => {})).to.be.rejectedWith(
            `Team member with id=${payload.modelId} is already archived`,
        );
    });

    it('should throw error if you want to unarchive employee who already unarchived', async () => {
        teamMember = await factory.create(FACTORIES_NAMES.teamMember, { isDeleted: false });
        const payload = {
            modelId: teamMember.id,
            archiveBoolean: false,
        };

        await expect(validateArchivedTeamMemberUow(payload, () => {})).to.be.rejectedWith(
            `Team member with id=${payload.modelId} is already unarchived`,
        );
    });

    it('should successfully return payload', async () => {
        const payload = {
            modelId: teamMember.id,
            archiveBoolean: true,
        };
        const res = await validateArchivedTeamMemberUow(payload);
        expect(res).deep.equal(payload);
    });
});

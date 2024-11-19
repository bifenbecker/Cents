require('../../testHelper');
const validateTeamMember = require('../../../validations/validateTeamMember');
const { expect } = require('../../support/chaiHelper');
const factory = require('../../factories');

describe('test validateTeamMember', () => {
    let business, store, teamMember;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', {
            businessId: business.id,
        });
        teamMember = await factory.create('teamMember', {
            businessId: business.id,
        });
        await factory.create('teamMemberStore', {
            teamMemberId: teamMember.id,
            storeId: store.id,
        });
    });

    it('should be rejected if team member is not checked in', async () => {
        await factory.create('teamMemberCheckIn', {
            teamMemberId: teamMember.id,
            storeId: store.id,
            isCheckedIn: false,
        });

        await expect(
            validateTeamMember(teamMember.employeeCode, business.id, store.id),
        ).to.be.rejectedWith('Please check-in to continue.');
    });

    it('should return team meber', async () => {
        await factory.create('teamMemberCheckIn', {
            teamMemberId: teamMember.id,
            storeId: store.id,
            isCheckedIn: true,
        });

        const result = await validateTeamMember(teamMember.employeeCode, business.id, store.id);

        expect(result.id).to.equal(teamMember.id);
    });

    it('should be rejected if invalid args were passed', async () => {
        await expect(validateTeamMember()).to.be.rejected;
        await expect(validateTeamMember(null, null, null)).to.be.rejected;
        await expect(validateTeamMember({}, {}, {})).to.be.rejected;
        await expect(validateTeamMember('a', 'b', 'c')).to.be.rejected;
    });

    it('should be rejected if invalid employee code was passed', async () => {
        await expect(validateTeamMember(-1, business.id, store.id)).to.be.rejectedWith(
            'Invalid employee code',
        );
    });

    it('should be rejected if invalid business id was passed', async () => {
        await expect(validateTeamMember(teamMember.employeeCode, -1, store.id)).to.be.rejected;
    });

    it('should be rejected if invalid store id was passed', async () => {
        await expect(validateTeamMember(teamMember.employeeCode, business.id, -1)).to.be.rejected;
    });
});

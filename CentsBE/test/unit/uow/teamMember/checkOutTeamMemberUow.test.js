require('../../../testHelper');

const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');

const { expect } = require('../../../support/chaiHelper');
const checkOutTeamMemberUow = require('../../../../uow/teamMember/checkOutTeamMemberUow');
const TeamMemberCheckIn = require('../../../../models/teamMemberCheckIn');

const setupTestData = async ({ 
    checkInTime = new Date().toISOString(),
    isCheckedIn, 
    checkOutTime = null 
}) => {
    const teamMemberCheckIn = await factory.create(FACTORIES_NAMES.teamMemberCheckIn, {
        isCheckedIn,
        checkInTime,
        checkOutTime,
    });

    const teamMemberId = teamMemberCheckIn.teamMemberId;

    return { teamMemberId };
}

describe('test checkOutTeamMemberUow', () => {
    it('should successfully checkout teamMember', async () => {
        const checkInTime = new Date();
        const { teamMemberId } = await setupTestData({
            checkInTime: checkInTime.toISOString(),
            isCheckedIn: true
        });

        const checkOutTime = new Date();
        const payload = { 
            teamMemberId, 
            checkOutTime: checkOutTime.toISOString()
        };
        await checkOutTeamMemberUow(payload);
        // validate payload consistency
        expect(payload).to.have.property('teamMemberId', teamMemberId);
        expect(payload).to.have.property('checkOutTime', checkOutTime.toISOString());
        // validate new fields of payload 
        expect(payload).to.have.property('teamMemberCheckIn');
        expect(payload.teamMemberCheckIn).to.have.property('teamMemberId', teamMemberId);
        expect(payload.teamMemberCheckIn).to.have.property('isCheckedIn', false);
        expect(payload.teamMemberCheckIn.checkInTime).equalToDateTime(checkInTime);
        expect(payload.teamMemberCheckIn.checkOutTime).equalToDateTime(checkOutTime);
        expect(payload).to.include.all.keys('teamMemberId', 'checkOutTime', 'teamMemberCheckIn')

        // validate actual data in DB
        const teamMemberCheckIn = await TeamMemberCheckIn.query().findOne({ teamMemberId });
        expect(teamMemberCheckIn).to.have.property('isCheckedIn', false);
        expect(teamMemberCheckIn.checkInTime).equalToDateTime(checkInTime);
        expect(teamMemberCheckIn.checkOutTime).to.be.a.dateString();
    });

    it('should ignore teamMember who is not checkedIn', async () => {
        const checkInTime = new Date();
        const checkOutTime = new Date();

        const { teamMemberId } = await setupTestData({
            isCheckedIn: false,
            checkInTime: checkInTime.toISOString(),
            checkOutTime: checkOutTime.toISOString(),
        });

        const payload = { 
            teamMemberId, 
            checkOutTime: checkOutTime.toISOString(),
        };
        await checkOutTeamMemberUow(payload);
        // validate payload consistency
        expect(payload).to.include.all.keys('teamMemberId', 'checkOutTime', 'teamMemberCheckIn')
        expect(payload).to.have.property('teamMemberId', teamMemberId);
        expect(payload).to.have.property('checkOutTime', checkOutTime.toISOString());
        expect(payload).to.have.property('teamMemberCheckIn', undefined);
        // validate actual data in DB
        const teamMemberCheckIn = await TeamMemberCheckIn.query().findOne({ teamMemberId });
        expect(teamMemberCheckIn).to.have.property('isCheckedIn', false);
        expect(teamMemberCheckIn.checkInTime).equalToDateTime(checkInTime);
        expect(teamMemberCheckIn.checkOutTime).equalToDateTime(checkOutTime);
    });
});

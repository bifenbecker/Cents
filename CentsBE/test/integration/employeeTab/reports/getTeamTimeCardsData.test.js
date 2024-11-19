require('../../../testHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const {
    assertGetResponseError,
    assertGetResponseSuccess,
} = require('../../../support/httpRequestsHelper');
const {
    dateFormat,
    addOrSubtractDaysToCurrentDate,
} = require('../../../../helpers/dateFormatHelper');
const { getTimeDifference } = require('../../../support/dateTimeHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

const timeZone = "America/New_York";

function getApiEndPoint() {
    return `/api/v1/employee-tab/reports/team-members/time-cards/list`;
}

function getDuration(startTime, endTime) {
    let hours = parseInt(
        getTimeDifference(startTime, endTime, timeZone, { inHours: true }),
        10,
    );
    let minutes =
        parseInt(
            getTimeDifference(startTime, endTime, timeZone, { inMinutes: true }),
            10,
        ) % 60;
    return `${hours}:${minutes}`;
}

describe('test getTeamTimeCardsData', () => {
    it('should throw an error if token is not sent', async () => {
        await assertGetResponseError({
            url: getApiEndPoint(),
            token: '',
            code: 401,
            expectedError: 'Please sign in to proceed.',
        });
    });
    describe('with valid params', () => {
        let token,
            user,
            params,
            business,
            teamMember,
            store,
            teamMember2,
            teamMemberCheckIn,
            teamMemberCheckIn2;

        beforeEach(async () => {
            user = await factory.create(FN.user);
            business = await factory.create(FN.laundromatBusiness, {
                userId: user.id,
            });
            store = await factory.create(FN.store, {
                businessId: business.id,
            });
            token = generateToken({ id: store.id });
            teamMember = await factory.create(FN.teamMember, {
                userId: user.id,
                businessId: business.id,
            });
            teamMember2 = await factory.create(FN.teamMember, {
                userId: user.id,
                businessId: business.id,
            });
            teamMemberCheckIn = await factory.create(FN.teamMemberCheckIn, {
                teamMemberId: teamMember.id,
                storeId: store.id,
                checkOutTime: addOrSubtractDaysToCurrentDate(0.5, false, true, timeZone),
                checkInTime: new Date(new Date()).toISOString('en-US', {timeZone: timeZone}),
            });
            teamMemberCheckIn2 = await factory.create(FN.teamMemberCheckIn, {
                teamMemberId: teamMember2.id,
                storeId: store.id,
                checkInTime: new Date(new Date()).toISOString('en-US', {timeZone: timeZone}),
                checkOutTime: new Date(new Date()).toISOString('en-US', {timeZone: timeZone}),
            });

            params = {
                startDate: addOrSubtractDaysToCurrentDate(7, false, false, timeZone),
                endDate: addOrSubtractDaysToCurrentDate(1, false, true, timeZone),
                timeZone,
                teamMember: [teamMember.id, teamMember2.id],
            };
        });
        it('should get team time cards data successfully', async () => {
            const res = await assertGetResponseSuccess({
                url: getApiEndPoint(),
                params,
                token,
            });
            const { report } = res.body;
            expect(res.body).to.have.property('columns');
            expect(res.body).to.have.property('report');
            expect(report.length).not.to.eq(0);
            expect(report.map((e) => e.employeeName)).to.include(
                `${user.firstname} ${user.lastname}`,
            );
            expect(report.map((e) => e.duration)).to.include(
                getDuration(teamMemberCheckIn.checkInTime, teamMemberCheckIn.checkOutTime),
            );
            expect(report.map((e) => e.duration)).to.include(
                getDuration(teamMemberCheckIn.checkInTime, teamMemberCheckIn.checkOutTime),
            );
            expect(report.map((e) => e.checkInTime)).to.include(
                dateFormat(teamMemberCheckIn.checkInTime, timeZone, 'hh:mm A z'),
            );
            expect(report.map((e) => e.checkInDate)).to.include(
                dateFormat(teamMemberCheckIn.checkInTime, timeZone, 'MM-DD-YYYY'),
            );
            expect(report.map((e) => e.checkOutTime)).to.include(
                dateFormat(teamMemberCheckIn2.checkOutTime, timeZone, 'hh:mm A z'),
            );
            expect(report.map((e) => e.checkOutDate)).to.include(
                dateFormat(teamMemberCheckIn2.checkOutTime, timeZone, 'MM-DD-YYYY'),
            );
            expect(report.map((e) => e.Store)).to.include(store.name);
        });
    });

    it('should throw an error if params not passed', async () => {
        const store = await factory.create(FN.store);
        const token = generateToken({ id: store.id });

        await assertGetResponseError({
            url: getApiEndPoint(),
            token,
            code: 500,
        });
    });
});

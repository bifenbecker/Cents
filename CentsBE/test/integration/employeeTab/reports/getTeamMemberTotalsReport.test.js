require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint() {
    return `/api/v1/employee-tab/reports/team-members/totals/list`;
}

describe('test getTeamMemberTotalsReport', () => {
    it('should throw an error if token is not sent', async () => {
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint()).set('authtoken', '');
        const { error } = JSON.parse(res.text);
        res.should.have.status(401);
        expect(error).to.equal('Please sign in to proceed.');
    });

    it('should get team member totals report successfully', async () => {
        const laundromatBusiness = await factory.create('laundromatBusiness');
        const store = await factory.create('store', {
            businessId: laundromatBusiness.id,
        });
        const token = generateToken({ id: store.id });
        const user = await factory.create('user');
        const teamMember = await factory.create('teamMember', {
            userId: user.id,
        });
        const teamMemberCheckIn = await factory.create('teamMemberCheckIn', {
            teamMemberId: teamMember.id,
            storeId: store.id,
            checkInTime: '2022-05-10T12:59:32.582Z',
            checkOutTime: new Date().toISOString(),
        });
        const teamMemberStore = await factory.create('teamMemberStore', {
            teamMemberId: teamMember.id,
            storeId: store.id,
        });
        const serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
            employeeCode: teamMember.id,
            placedAt: '2022-05-10T12:59:32.582Z',
        });
        const serviceOrderWeight = await factory.create('serviceOrderWeight', {
            teamMemberId: teamMember.id,
            serviceOrderId: serviceOrder.id,
            status: 'PROCESSING',
            step: 1,
            createdAt: '2022-05-10T12:59:32.582Z',
        });
        const orderActivityLog = await factory.create('orderActivityLog', {
            teamMemberId: teamMember.id,
            orderId: serviceOrder.id,
            status: 'READY_FOR_PICKUP',
            updatedAt: '2022-05-10T12:59:32.582Z',
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('columns');
        expect(res.body).to.have.property('report');
        expect(res.body.report.length).not.to.eq(0);
        expect(res.body.report[0].fullName).to.eq(`${user.firstname} ${user.lastname}`);
    });

    it('should throw an error if params not passed', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{}).set('authtoken', token);
        res.should.have.status(500);
    });
});
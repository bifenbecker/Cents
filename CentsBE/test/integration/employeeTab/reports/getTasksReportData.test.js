require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint() {
    return `/api/v1/employee-tab/reports/tasks`;
}

describe('test getTasksReportData', () => {
    it('should throw an error if token is not sent', async () => {
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint()).set('authtoken', '');
        const { error } = JSON.parse(res.text);
        res.should.have.status(401);
        expect(error).to.equal('Please sign in to proceed.');
    });

    it('should get tasks report data successfully', async () => {
        const dayNumber = new Date('2022-05-10T12:59:32.582Z').getDay();
        const laundromatBusiness = await factory.create('laundromatBusiness');
        const store = await factory.create('store', {
            businessId: laundromatBusiness.id,
        });
        const token = generateToken({ id: store.id });
        const user = await factory.create('user');
        const shift = await factory.create('shift', {
            storeId: store.id,
        });
        const task = await factory.create('task', {
            businessId: laundromatBusiness.id,
            createdAt: '2022-05-10T12:59:32.582Z',
        });
        const timing = await factory.create('timing', {
            shiftId: shift.id,
            day: dayNumber,
        });
        const taskTimings = await factory.create('taskTimings', {
            timingsId: timing.id,
            taskId: task.id,
        });
        const teamMember = await factory.create('teamMember', {
            businessId: laundromatBusiness.id,
            userId: user.id,
        });
        const taskLogs = await factory.create('taskLogs', {
            taskTimingId: taskTimings.id,
            teamMemberId: teamMember.id,
            completedAt: '2022-05-10T12:59:32.582Z',
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
        expect(res.body.report[0].Employee).to.eq(`${user.firstname} ${user.lastname}`);
        expect(res.body.report[0].task).to.eq(task.name);
    });

    it('should throw an error if params not passed', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{}).set('authtoken', token);
        res.should.have.status(500);
    });
});
require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper')
const { generateToken } = require('../../../support/apiTestHelper')
const factory = require('../../../factories')
const { expect } = require('../../../support/chaiHelper');
const Settings = require('../../../../models/businessSettings');
const TaskLogs = require('../../../../models/taskLogs');


describe('test createTasks', () => {
    let store, token, shift, timing, task, taskTimings, teamMember, completedAt;
    const apiEndPoint = '/api/v1/employee-tab/tasks';

    beforeEach(async () => {
        store = await factory.create('store');
        token = generateToken({
            id: store.id,
        });
        shift = await factory.create('shift', {
            storeId: store.id,
        });
        timing = await factory.create('timing', {
            shiftId: shift.id,
            startTime: 'Tue Sep 21 2011 15:00:58',
            endTime: 'Tue Sep 21 2031 23:00:58',
        });
        task = await factory.create('task', {
            businessId: store.businessId,
        });
        taskTimings = await factory.create('taskTimings', {
            taskId: task.id,
            timingsId: timing.id
        });
        teamMember = await factory.create('teamMember', {
            businessId: store.businessId,
        });
        completedAt = '2021-09-21 20:00:58+00';
    });

    it('should complete the task', async () => {
        body = { 
            employeeCode: `${teamMember.employeeCode}`,
            taskId: task.id,
            timingsId: taskTimings.id,
            completedAt,
        };

        const res = await ChaiHttpRequestHepler.post(apiEndPoint, {}, body)
        .set('authtoken', token);
        res.should.have.status(200);

        const taskLogs = await TaskLogs.query()
            .select('*')
            .where('teamMemberId', '=', teamMember.id)
            .where('taskTimingId', '=', taskTimings.id)
            .where('completedAt', '=', completedAt);

        expect(taskLogs).to.not.be.empty;
        expect(res.body).to.have.property('success').to.equal(true);
    });

    it('should return error if taskId is not passed', async () => {
        body = { 
            employeeCode: `${teamMember.employeeCode}`,
            timingsId: taskTimings.id,
            completedAt,
        };        
        const res = await ChaiHttpRequestHepler.post(apiEndPoint, {}, body)
        .set('authtoken', token);

        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal('child "taskId" fails because ["taskId" is required]');
    });

    it('should return error if timingsId is not passed', async () => {
        body = { 
            employeeCode: `${teamMember.employeeCode}`,
            taskId: task.id,
            completedAt,
        };
        const res = await ChaiHttpRequestHepler.post(apiEndPoint, {}, body)
        .set('authtoken', token);

        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal('child "timingsId" fails because ["timingsId" is required]');
    });

    it('should return error if completedAt is not passed', async () => {
        body = { 
            employeeCode: `${teamMember.employeeCode}`,
            taskId: task.id,
            timingsId: taskTimings.id,
        };
        const res = await ChaiHttpRequestHepler.post(apiEndPoint, {}, body)
        .set('authtoken', token);
        
        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal('child "completedAt" fails because ["completedAt" is required]');
    });

    it('should return error if employeeCode is not passed', async () => {
        body = { 
            taskId: task.id,
            timingsId: taskTimings.id,
            completedAt,
        };
        const res = await ChaiHttpRequestHepler.post(apiEndPoint, {}, body)
        .set('authtoken', token);

        res.should.have.status(500);
        expect(res.body).to.have.property('error');
    });

    it('should return error if employeeCode is required and passed null', async () => {
        // remove default BusinessSettings
        await Settings.query()
            .findOne({
                businessId: store.businessId,
            })
            .del();
        // create businessSettings with requiresEmployeeCode: true
        await factory.create('businessSetting', {
            requiresEmployeeCode: true,
            businessId: store.businessId,
        });
        body = {
            employeeCode: null,
            taskId: task.id,
            timingsId: taskTimings.id,
            completedAt,
        };        
        const res = await ChaiHttpRequestHepler.post(apiEndPoint, {}, body)
        .set('authtoken', token);

        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal('Employee Code is required.');
    });

    it('should return success if employeeCode is required and it is passed', async () => {
        // remove default BusinessSettings
        await Settings.query()
            .findOne({
                businessId: store.businessId,
            })
            .del();
        // create businessSettings with requiresEmployeeCode: true
        await factory.create('businessSetting', {
            requiresEmployeeCode: true,
            businessId: store.businessId,
        });
        body = {
            employeeCode: '1',
            taskId: task.id,
            timingsId: taskTimings.id,
            completedAt,
        };
        const res = await ChaiHttpRequestHepler.post(apiEndPoint, {}, body)
        .set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
    });
})

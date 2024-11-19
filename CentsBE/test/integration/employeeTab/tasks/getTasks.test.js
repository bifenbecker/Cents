require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper')
const { generateToken } = require('../../../support/apiTestHelper')
const factory = require('../../../factories')
const { expect } = require('../../../support/chaiHelper');

describe('test getTasks', () => {
    let store, token, payload, shift, timing, task, taskTimings;
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
            endTime: 'Tue Sep 21 2031 22:00:58',
        });
        task = await factory.create('task', {
            businessId: store.businessId,
        });
        taskTimings = await factory.create('taskTimings', {
            taskId: task.id,
            timingsId: timing.id
        });
    });

    it('should return shift with one task', async () => {
        payload = { 
            currentDay: timing.day,
            currentTime: '2021-09-21 20:00:58+00',
        };
        const res = await ChaiHttpRequestHepler.get(apiEndPoint, payload)
        .set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('hasShift').to.equal(true);
        expect(res.body).to.have.property('tasks').to.not.be.empty;
        expect(res.body.tasks[0]).to.have.property('id').to.equal(task.id);
        expect(res.body.tasks[0]).to.have.property('timingsId').to.equal(taskTimings.id);
        expect(res.body.tasks[0]).to.have.property('isComplete').to.equal(false);
        expect(res.body.tasks.length).to.equal(1);
    });

    it('should return shift with two tasks', async () => {
        const anotherTaskTimings = await factory.create('taskTimings', {
            taskId: task.id,
            timingsId: timing.id
        });
        payload = { 
            currentDay: timing.day,
            currentTime: '2021-09-21 19:59:58+00',
        };
        const res = await ChaiHttpRequestHepler.get(apiEndPoint, payload)
        .set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('hasShift').to.equal(true);
        expect(res.body).to.have.property('tasks').to.not.be.empty;
        expect(res.body.tasks[0]).to.have.property('id').to.equal(task.id);
        expect(res.body.tasks[0]).to.have.property('timingsId').to.equal(taskTimings.id);
        expect(res.body.tasks[0]).to.have.property('isComplete').to.equal(false);
        expect(res.body.tasks.length).to.equal(2);
    });

    it('should not return shifts if task is deleted', async () => {
        const deletedTask = await factory.create('task', {
            businessId: store.businessId,
            deletedAt: new Date().toISOString(),
        });
        const taskTimings = await factory.create('taskTimings', {
            taskId: deletedTask.id,
            timingsId: timing.id
        });
        payload = { 
            currentDay: timing.day,
            currentTime: '2021-09-21 20:00:58+00',
        };
        const res = await ChaiHttpRequestHepler.get(apiEndPoint, payload)
        .set('authtoken', token);
        
        res.should.have.status(200);
        expect(res.body).to.have.property('hasShift').to.equal(true);
        expect(res.body).to.have.property('tasks').to.not.be.empty;
        const isIncludeDeletedTask = res.body.tasks.filter(task => task.id === deletedTask.id);
        expect(isIncludeDeletedTask).to.be.empty;
    });

    it(`should return status 200 if doesn't find shifts`, async () => {
        payload = { 
            currentDay: 1,
            currentTime: '2091-09-21 08:00:58+00',
        };
        const res = await ChaiHttpRequestHepler.get(apiEndPoint, payload)
        .set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('hasShift').to.equal(false);
    });

    it('should return error if currentDay and currentTime not passed', async () => {
        const res = await ChaiHttpRequestHepler.get(apiEndPoint, {})
        .set('authtoken', token);

        res.should.have.status(500);
    });
})

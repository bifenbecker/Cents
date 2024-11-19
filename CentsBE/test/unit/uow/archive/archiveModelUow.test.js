require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const Task = require('../../../../models/tasks');

const archiveModel = require('../../../../uow/archive/archiveModelUow');

describe('test archiveModel Uow', () => {
    let task, business;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        task = await factory.create('task');
    });

    it('should set deletedAt as not null', async () => {
        const payload = {
            modelName: Task,
            modelId: task.id,
            archiveBoolean: true,
        };

        // call Uow
        await archiveModel(payload);

        // assert
        const updatedTask = await Task.query().findById(task.id);
        expect(updatedTask.deletedAt).to.not.equal(null);
    });

    it('should set deletedAt as null', async () => {
        const payload = {
            modelName: Task,
            modelId: task.id,
            archiveBoolean: false,
        };

        // call Uow
        await archiveModel(payload);

        // assert
        const updatedTask = await Task.query().findById(task.id);
        expect(updatedTask.deletedAt).to.equal(null);
    });
});

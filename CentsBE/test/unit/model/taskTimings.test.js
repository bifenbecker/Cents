require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasAssociation,
    hasTable,
    belongsToOne,
} = require('../../support/objectionTestHelper');
const TaskTimings = require('../../../models/taskTimings');

describe('test TaskTimings model', () => {
    it('should return true if TaskTimings table exists', async () => {
        const hasTableName = await hasTable(TaskTimings.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', async () => {
        expect(TaskTimings.idColumn).to.equal('id');
    });

    it('TaskTimings should have taskLogs association', async () => {
        hasAssociation(TaskTimings, 'taskLogs');
    });

    it('TaskTimings should BelongsToOneRelation taskLogs association', async () => {
        belongsToOne(TaskTimings, 'taskLogs')
    });
});
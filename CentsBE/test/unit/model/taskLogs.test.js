require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasTable,
} = require('../../support/objectionTestHelper');
const TaskLogs = require('../../../models/taskLogs');

describe('test TaskLogs model', () => {
    it('should return true if TaskLogs table exists', async () => {
        const hasTableName = await hasTable(TaskLogs.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', async () => {
        expect(TaskLogs.idColumn).to.equal('id');
    });
});
require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasAssociation,
    hasTable,
    hasMany,
    belongsToOne,
    hasManyToMany,
} = require('../../support/objectionTestHelper');
const Tasks = require('../../../models/tasks');

describe('test Tasks model', () => {
    it('should return true if Tasks table exists', async () => {
        const hasTableName = await hasTable(Tasks.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', async () => {
        expect(Tasks.idColumn).to.equal('id');
    });

    it('Tasks should have timings association', () => {
        hasAssociation(Tasks, 'timings');
    });

    it('Tasks should have many timings association', async () => {
        hasManyToMany(Tasks, 'timings');
    });

    it('Tasks should have laundromatBusiness association', async () => {
        hasAssociation(Tasks, 'laundromatBusiness');
    });

    it('Tasks should BelongsToOneRelation laundromatBusiness association', async () => {
        belongsToOne(Tasks, 'laundromatBusiness')
    });

    it('Tasks should have taskTimings association', () => {
        hasAssociation(Tasks, 'taskTimings');
    });

    it('Tasks should have many taskTimings association', async () => {
        hasMany(Tasks, 'taskTimings');
    });
});
require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasTable, hasAssociation, belongsToOne, hasManyToMany } = require('../../support/objectionTestHelper');
const MachineModel = require('../../../models/machineModel');

describe('test MachineModel model', () => {
    it('should return true if machineModels table exists', async () => {
        const hasTableName = await hasTable(MachineModel.tableName);
        expect(hasTableName).to.be.true;
    });

    it('machineModels should have machineModelLoads association', () => {
        hasAssociation(MachineModel, 'loads');
    });

    it('machineModels should have ManyToManyRelation machineModelLoads association', () => {
        hasManyToMany(MachineModel, 'loads');
    });

    it('machineModels should have machineModelModifiers association', () => {
        hasAssociation(MachineModel, 'modifiers');
    });

    it('machineModels should have ManyToManyRelation machineModelModifiers association', () => {
        hasManyToMany(MachineModel, 'modifiers');
    });

    it('machineModels should have machineTypes association', () => {
        hasAssociation(MachineModel, 'machineType');
    });

    it('machineModels should BelongsToOneRelation machineTypes association', () => {
        belongsToOne(MachineModel, 'machineType');
    });
});

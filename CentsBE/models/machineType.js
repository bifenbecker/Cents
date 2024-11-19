const Model = require('./index');

class MachineType extends Model {
    static get tableName() {
        return 'machineTypes';
    }

    static get idColumn() {
        return 'id';
    }
    static get relationMappings() {
        const MachineModel = require('./machineModel');

        return {
            models: {
                relation: Model.HasManyRelation,
                modelClass: MachineModel,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${MachineModel.tableName}.typeId`,
                },
            },
        };
    }
}

module.exports = MachineType;

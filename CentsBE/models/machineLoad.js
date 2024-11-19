const Model = require('./index');

class MachineLoadType extends Model {
    static get tableName() {
        return 'machineLoadTypes';
    }

    static get idColumn() {
        return 'id';
    }
    static get relationMappings() {
        const MachineModel = require('./machineModel');
        const MachineModelLoad = require('./machineModelLoad');
        return {
            models: {
                relation: Model.ManyToManyRelation,
                modelClass: MachineModel,
                join: {
                    from: `${this.tableName}.id`,
                    through: {
                        from: `${MachineModelLoad.tableName}.loadId`,
                        to: `${MachineModelLoad.tableName}.modelId`,
                    },
                    to: `${MachineModel.tableName}.id`,
                },
            },
        };
    }
}

module.exports = MachineLoadType;

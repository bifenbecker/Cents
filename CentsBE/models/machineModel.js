const Model = require('./index');

class MachineModel extends Model {
    static get tableName() {
        return 'machineModels';
    }

    static get idColumn() {
        return 'id';
    }
    static get relationMappings() {
        const MachineLoad = require('./machineLoad');
        const MachineModelLoad = require('./machineModelLoad');
        const MachineModifierType = require('./machineModifierType');
        const MachineModelModifier = require('./machineModelModifier');
        const MachineType = require('./machineType');

        return {
            loads: {
                relation: Model.ManyToManyRelation,
                modelClass: MachineLoad,
                join: {
                    from: `${MachineModel.tableName}.id`,
                    through: {
                        from: `${MachineModelLoad.tableName}.modelId`,
                        to: `${MachineModelLoad.tableName}.loadId`,
                    },
                    to: `${MachineLoad.tableName}.id`,
                },
            },
            modifiers: {
                relation: Model.ManyToManyRelation,
                modelClass: MachineModifierType,
                join: {
                    from: `${MachineModel.tableName}.id`,
                    through: {
                        from: `${MachineModelModifier.tableName}.modelId`,
                        to: `${MachineModelModifier.tableName}.machineModifierTypeId`,
                    },
                    to: `${MachineModifierType.tableName}.id`,
                },
            },
            machineType: {
                relation: Model.BelongsToOneRelation,
                modelClass: MachineType,
                join: {
                    from: `${this.tableName}.typeId`,
                    to: `${MachineType.tableName}.id`,
                },
            },
        };
    }
}

module.exports = MachineModel;

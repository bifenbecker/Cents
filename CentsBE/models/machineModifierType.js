const Model = require('./index');

class MachineModifierType extends Model {
    static get tableName() {
        return 'machineModifierTypes';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeUpdate() {
        if (!this.updatedAt) {
            this.updatedAt = new Date().toISOString();
        }
    }

    static get relationMappings() {
        const MachineModel = require('./machineModel');
        const MachineModelModifier = require('./machineModelModifier');
        return {
            models: {
                relation: Model.ManyToManyRelation,
                modelClass: MachineModel,
                join: {
                    from: `${this.tableName}.id`,
                    through: {
                        from: `${MachineModelModifier.tableName}.machineModifierTypeId`,
                        to: `${MachineModelModifier.tableName}.modelId`,
                    },
                    to: `${MachineModel.tableName}.id`,
                },
            },
        };
    }
}

module.exports = MachineModifierType;

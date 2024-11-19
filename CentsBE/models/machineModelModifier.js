const Model = require('./index');

class MachineModelModifier extends Model {
    static get tableName() {
        return 'machineModelModifiers';
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
        const MachinePrice = require('./machinePricing');
        const MachineModifierType = require('./machineModifierType');

        return {
            pricing: {
                relation: Model.HasManyRelation,
                modelClass: MachinePrice,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${MachinePrice.tableName}.modifierId`,
                },
            },
            machineModifierType: {
                relation: Model.BelongsToOneRelation,
                modelClass: MachineModifierType,
                join: {
                    from: `${this.tableName}.machineModifierTypeId`,
                    to: `${MachineModifierType.tableName}.id`
                }
            },
        };
    }
}

module.exports = MachineModelModifier;

const Model = require('./index');

class MachineModelLoad extends Model {
    static get tableName() {
        return 'machineModelLoads';
    }

    static get idColumn() {
        return 'id';
    }
    static get relationMappings() {
        const MachinePrice = require('./machinePricing');
        const MachineLoadType = require('./machineLoad');

        return {
            pricing: {
                relation: Model.HasManyRelation,
                modelClass: MachinePrice,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${MachinePrice.tableName}.loadId`,
                },
            },
            machineLoadType: {
                relation: Model.BelongsToOneRelation,
                modelClass: MachineLoadType,
                join: {
                    from: `${this.tableName}.loadId`,
                    to: `${MachineLoadType.tableName}.id`
                }
            },
        };
    }
}

module.exports = MachineModelLoad;

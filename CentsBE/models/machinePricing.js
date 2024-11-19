const Model = require('./index');

class MachinePricing extends Model {
    static get tableName() {
        return 'machinePricing';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Machine = require('./machine');
        const MachineModelLoad = require('./machineModelLoad');
        const MachineModelModifier = require('./machineModelModifier');
        return {
            machine: {
                relation: Model.BelongsToOneRelation,
                modelClass: Machine,
                join: {
                    from: `${this.tableName}.machineId`,
                    to: `${Machine.tableName}.id`,
                },
            },
            machineModelLoad: {
                relation: Model.BelongsToOneRelation,
                modelClass: MachineModelLoad,
                join: {
                    from: `${this.tableName}.loadId`,
                    to: `${MachineModelLoad.tableName}.id`
                }
            },
            machineModelModifier: {
                relation: Model.BelongsToOneRelation,
                modelClass: MachineModelModifier,
                join: {
                    from: `${this.tableName}.modifierId`,
                    to: `${MachineModelModifier.tableName}.id`
                }
            },
        };
    }
}

module.exports = MachinePricing;

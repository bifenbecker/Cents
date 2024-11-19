const Model = require('./index');
const MachineTurnsStats = require('./machineTurnsStats');

class Machine extends Model {
    static get tableName() {
        return 'machines';
    }

    async $afterInsert(queryContext) {
        await MachineTurnsStats.query(queryContext.transaction).insert({
            machineId: this.id,
            avgTurnsPerDay: 0,
            avgSelfServeRevenuePerDay: 0,
        });
    }

    static get idColumn() {
        return 'id';
    }
    static get relationMappings() {
        const Pairing = require('./pairing');
        const MachinePricing = require('./machinePricing');
        const Store = require('./store');
        const MachineModel = require('./machineModel');
        const Turn = require('./turns');
        const User = require('./user');
        const MachineTurnsStats = require('./machineTurnsStats');
        return {
            machinePricings: {
                relation: Model.HasManyRelation,
                modelClass: MachinePricing,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${MachinePricing.tableName}.machineId`,
                },
            },
            store: {
                relation: Model.BelongsToOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
                },
            },
            pairing: {
                relation: Model.HasManyRelation,
                modelClass: Pairing,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Pairing.tableName}.machineId`,
                },
            },
            turns: {
                relation: Model.HasManyRelation,
                modelClass: Turn,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Turn.tableName}.machineId`,
                },
            },
            model: {
                relation: Model.BelongsToOneRelation,
                modelClass: MachineModel,
                join: {
                    from: `${this.tableName}.modelId`,
                    to: `${MachineModel.tableName}.id`,
                },
            },
            createdBy: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: `${this.tableName}.userId`,
                    to: `${User.tableName}.id`,
                },
            },
            machineTurnsStats: {
                relation: Model.HasOneRelation,
                modelClass: MachineTurnsStats,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${MachineTurnsStats.tableName}.machineId`,
                },
            },
        };
    }
}

module.exports = Machine;

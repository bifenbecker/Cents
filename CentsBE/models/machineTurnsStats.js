const Model = require('./index');

class MachineTurnsStats extends Model {
    static get tableName() {
        return 'machineTurnsStats';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Machine = require('./machine');
        return {
            machine: {
                relation: Model.BelongsToOneRelation,
                modelClass: Machine,
                join: {
                    from: `${this.tableName}.machineId`,
                    to: `${Machine.tableName}.id`,
                },
            },
        };
    }
}

module.exports = MachineTurnsStats;

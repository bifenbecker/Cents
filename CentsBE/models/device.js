const Model = require('./index');

class Device extends Model {
    static get tableName() {
        return 'devices';
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
        const Batch = require('./batch');
        const Pairing = require('./pairing');
        const Turn = require('./turns');

        return {
            pairing: {
                relation: Model.HasManyRelation,
                modelClass: Pairing,
                join: {
                    from: `${Pairing.tableName}.deviceId`,
                    to: `${this.tableName}.id`,
                },
            },

            batch: {
                relation: Model.BelongsToOneRelation,
                modelClass: Batch,
                join: {
                    from: `${this.tableName}.batchId`,
                    to: `${Batch.tableName}.id`,
                },
            },

            turns: {
                relation: Model.HasManyRelation,
                modelClass: Turn,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Turn.tableName}.deviceId`,
                },
            },
        };
    }
}

module.exports = Device;

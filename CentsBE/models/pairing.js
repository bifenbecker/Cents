const Model = require('./index');

class Pairing extends Model {
    static get tableName() {
        return 'pairing';
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
        const Machine = require('./machine');
        const Device = require('./device');
        const User = require('./user');
        return {
            machine: {
                relation: Model.BelongsToOneRelation,
                modelClass: Machine,
                join: {
                    from: `${this.tableName}.machineId`,
                    to: `${Machine.tableName}.id`,
                },
            },
            device: {
                relation: Model.BelongsToOneRelation,
                modelClass: Device,
                join: {
                    from: `${this.tableName}.deviceId`,
                    to: `${Device.tableName}.id`,
                },
            },
            pairedBy: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: `${this.tableName}.pairedByUserId`,
                    to: `${User.tableName}.id`,
                },
            },
            unPairedBy: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: `${this.tableName}.unPairedByUserId`,
                    to: `${User.tableName}.id`,
                },
            },
        };
    }
}

module.exports = Pairing;

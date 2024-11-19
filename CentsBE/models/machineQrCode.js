const Model = require('./');

class MachineQrCode extends Model {
    static get tableName() {
        return 'machineQrCodes';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeCreate() {
        if (!this.createdAt) {
            this.createdAt = new Date().toISOString();
        }
        if (!this.deletedAt) {
            this.deletedAt = null;
        }
    }

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    }

    static get relationMappings() {
        const Machine = require('./machine');

        return {
            machine: {
                relation: Model.HasOneRelation,
                modelClass: Machine,
                join: {
                    from: `${this.tableName}.machineId`,
                    to: `${Machine.tableName}.id`,
                },
            },
        };
    }
}

module.exports = MachineQrCode;

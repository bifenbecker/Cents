const Model = require('./index');

class MachinePayment extends Model {
    static get tableName() {
        return 'machinePayments';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Turn = require('./turns');
        const MachinePaymentType = require('./machinePaymentType');
        const Payment = require('./payment');

        return {
            turn: {
                relation: Model.BelongsToOneRelation,
                modelClass: Turn,
                join: {
                    from: `${this.tableName}.turnId`,
                    to: `${Turn.tableName}.id`,
                },
            },
            machinePaymentType: {
                relation: Model.BelongsToOneRelation,
                modelClass: MachinePaymentType,
                join: {
                    from: `${this.tableName}.paymentTypeId`,
                    to: `${MachinePaymentType.tableName}.id`,
                },
            },
            payment: {
                relation: Model.BelongsToOneRelation,
                modelClass: Payment,
                join: {
                    from: `${this.tableName}.paymentId`,
                    to: `${Payment.tableName}.id`,
                },
            },
        };
    }
}

module.exports = MachinePayment;

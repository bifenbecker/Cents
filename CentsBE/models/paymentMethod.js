const Model = require('./index');

class PaymentMethod extends Model {
    static get tableName() {
        return 'paymentMethods';
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
        const CentsCustomer = require('./centsCustomer');

        return {
            customer: {
                relation: Model.BelongsToOneRelation,
                modelClass: CentsCustomer,
                join: {
                    from: `${this.tableName}.centsCustomerId`,
                    to: `${CentsCustomer.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = PaymentMethod;

const Model = require('./index');

class CentsCustomerAddress extends Model {
    static get tableName() {
        return 'centsCustomerAddresses';
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

module.exports = exports = CentsCustomerAddress;

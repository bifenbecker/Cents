const Model = require('./index');

class BusinessCustomer extends Model {
    static get tableName() {
        return 'businessCustomers';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeInsert() {
        this.createdAt = new Date();
    }

    $beforeUpdate() {
       this.updatedAt = new Date();
    }

    static get relationMappings() {
        const CentsCustomer = require('./centsCustomer');
        const laundromatBusiness = require('./laundromatBusiness');
        const PricingTier = require('./pricingTier')
        const StoreCustomer = require('./storeCustomer');
        return {
            centsCustomer: {
                relation: Model.BelongsToOneRelation,
                modelClass: CentsCustomer,
                join: {
                    from: `${this.tableName}.centsCustomerId`,
                    to: `${CentsCustomer.tableName}.id`,
                },
            },

            commercialTier: {
                relation: Model.BelongsToOneRelation,
                modelClass: PricingTier,
                join: {
                    from: `${this.tableName}.commercialTierId`,
                    to: `${PricingTier.tableName}.id`,
                },
            },
            business: {
              relation: Model.BelongsToOneRelation,
              modelClass: laundromatBusiness,
              join: {
                  from: `${this.tableName}.businessId`,
                  to: `${laundromatBusiness.tableName}.id`,
              },
            },
            storeCustomers: {
                relation: Model.HasManyRelation,
                modelClass: StoreCustomer,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${StoreCustomer.tableName}.businessCustomerId`,
                },
            }

        };
    }
}

module.exports = BusinessCustomer;

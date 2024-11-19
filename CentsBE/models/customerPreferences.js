const Model = require('./index.js')

class CustomerPreferences extends Model {
    static get tableName() {
        return 'customerPreferences';
    }

    $beforeUpdate() {
        if (!this.updatedAt) {
            this.updatedAt = new Date().toISOString();
        }
    }

    static get relationMappings(){
        const Business = require('./laundromatBusiness');
        const Customer = require('./centsCustomer.js');
        const PreferenceOption = require('./customerPrefOptions.js');

        return {
            business: {
                relation: Model.BelongsToOneRelation,
                modelClass: Business,
                join: {
                    from: `${this.tableName}.businessId`,
                    to: `${Business.tableName}.id`
                },
            },

            customer: {
                relation: Model.BelongsToOneRelation,
                modelClass: Customer,
                join: {
                    from: `${this.tableName}.customerId`,
                    to: `${Customer.tableName}.id`
                }
            },

            preferenceOption: {
                relation: Model.BelongsToOneRelation,
                modelClass: PreferenceOption,
                join: {
                    from: `${this.tableName}.optionId`,
                    to: `${PreferenceOption.tableName}.id`
                }
            }
        }
    }
}

module.exports = exports = CustomerPreferences;

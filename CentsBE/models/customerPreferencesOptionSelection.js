const Model = require('./index.js')
const PreferenceOptions = require('./preferenceOptions.js');
const CentsCustomer = require('./centsCustomer.js');

class CustomerPreferencesOptionSelection extends Model {
    static get tableName() {
        return 'customerPreferencesOptionSelection';
    }

    $beforeUpdate() {
        if (!this.updatedAt) {
            this.updatedAt = new Date().toISOString();
        }
    }

    static get relationMappings(){

        return {
            preferenceOption: {
                relation: Model.BelongsToOneRelation,
                modelClass: PreferenceOptions,
                join: {
                    from: `${this.tableName}.preferenceOptionId`,
                    to: `${PreferenceOptions.tableName}.id`
                },
            },
            centsCustomer: {
                relation: Model.BelongsToOneRelation,
                modelClass: CentsCustomer,
                join: {
                    from: `${this.tableName}.centsCustomerId`,
                    to: `${CentsCustomer.tableName}.id`
                },
            }
        }
    }
}

module.exports = exports = CustomerPreferencesOptionSelection;

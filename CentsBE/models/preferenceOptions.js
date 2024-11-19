const Model = require('./index.js')

class PreferenceOptions extends Model {
    static get tableName() {
        return 'preferenceOptions';
    }

    $beforeUpdate() {
        if (!this.updatedAt) {
            this.updatedAt = new Date().toISOString();
        }
    }

    static get relationMappings(){
        const businessPreference = require('./businessCustomerPreferences.js');

        return {
            businessPreference: {
                relation: Model.BelongsToOneRelation,
                modelClass: businessPreference,
                join: {
                    from: `${this.tableName}.businessCustomerPreferenceId`,
                    to: `${businessPreference.tableName}.id`
                },
            },
        }
    }
}

module.exports = exports = PreferenceOptions;

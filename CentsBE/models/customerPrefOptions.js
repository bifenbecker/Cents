const Model = require('./index.js')

class CustomerPrefOptions extends Model {
    static get tableName() {
        return 'customerPrefOptions';
    }

    $beforeUpdate() {
        if (!this.updatedAt) {
            this.updatedAt = new Date().toISOString();
        }
    }

    static get relationMappings(){
        const Business = require('./laundromatBusiness');

        return {
            business: {
                relation: Model.BelongsToOneRelation,
                modelClass: Business,
                join: {
                    from: `${this.tableName}.businessId`,
                    to: `${Business.tableName}.id`
                },
            },
        }
    }
}

module.exports = exports = CustomerPrefOptions;

const Model = require('./index');

class BusinessOrderCount extends Model {
    static get tableName() {
        return 'businessOrdersCount';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    }

    static get relationMappings() {
        const LaundromatBusiness = require('./laundromatBusiness');
        return {
            business: {
                relation: Model.BelongsToOneRelation,
                modelClass: LaundromatBusiness,
                join: {
                    from: `${this.tableName}.businessId`,
                    to: `${LaundromatBusiness.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = BusinessOrderCount;

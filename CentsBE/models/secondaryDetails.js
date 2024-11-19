const Model = require('./index');

class SecondaryDetail extends Model {
    static get tableName() {
        return 'secondaryDetails';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeInsert() {
        if (!this.languageId) {
            this.languageId = 1;
        }
    }

    $beforeUpdate() {
        if (!this.languageId) {
            this.languageId = 1;
        }
    }

    static get relationMappings() {
        const Business = require('./laundromatBusiness');

        return {
            business: {
                relation: Model.BelongsToOneRelation,
                modelClass: Business,
                join: {
                    from: `${this.tableName}.businessId`,
                    to: `${Business.tableName}.id`,
                },
            },
        };
    }
}

module.exports = SecondaryDetail;

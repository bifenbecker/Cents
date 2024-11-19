const Model = require('./index');

class BagNoteTag extends Model {
    static get tableName() {
        return 'bagNoteTags';
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
        const Business = require('./laundromatBusiness');

        return {
            business: {
                relation: Model.HasOneRelation,
                modelClass: Business,
                join: {
                    from: `${this.tableName}.businessId`,
                    to: `${Business.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = BagNoteTag;

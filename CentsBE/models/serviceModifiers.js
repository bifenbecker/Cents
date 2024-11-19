const Model = require('./index.js');

class ServiceModifier extends Model {
    static get tableName() {
        return 'serviceModifiers';
    }

    $beforeUpdate() {
        if (!this.updatedAt) {
            this.updatedAt = new Date().toISOString();
        }
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Modifiers = require('./modifiers');
        return {
            modifier: {
                relation: Model.BelongsToOneRelation,
                modelClass: Modifiers,
                join: {
                    from: `${this.tableName}.modifierId`,
                    to: `${Modifiers.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = ServiceModifier;

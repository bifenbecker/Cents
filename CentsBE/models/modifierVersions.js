const Model = require('./index');

class ModifierVersions extends Model {
    static get tableName() {
        return 'modifierVersions';
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
        const Modifier = require('./modifiers');
        return {
            modifier: {
                relation: Model.HasOneRelation,
                modelClass: Modifier,
                join: {
                    from: `${this.tableName}.modifierId`,
                    to: `${Modifier.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = ModifierVersions;

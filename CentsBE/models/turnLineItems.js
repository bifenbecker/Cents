const Model = require('./index');

class TurnLineItem extends Model {
    static get tableName() {
        return 'turnLineItems';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Turn = require('./turns');

        return {
            turn: {
                relation: Model.BelongsToOneRelation,
                modelClass: Turn,
                join: {
                    from: `${this.tableName}.turnId`,
                    to: `${Turn.tableName}.id`,
                },
            },
        };
    }
}

module.exports = TurnLineItem;

const Model = require('./index');

class Prices extends Model {
    static get tableName() {
        return 'prices';
    }

    static get relationMappings() {
        const WashService = require('./washService');
        return {
            laundryType: {
                relation: Model.BelongsToOneRelation,
                modelClass: WashService,
                join: {
                    from: `${this.tableName}.washServiceId`,
                    to: `${WashService.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = Prices;

const Model = require('./index');

class DeliveryTimingSettings extends Model {
    static get tableName() {
        return 'deliveryTimingSettings';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Timing = require('./timings');

        return {
            timing: {
                relation: Model.BelongsToOneRelation,
                modelClass: Timing,
                join: {
                    from: `${this.tableName}.timingsId`,
                    to: `${Timing.tableName}.id`,
                },
            },
        };
    }

    getTiming() {
        return this.$relatedQuery('timing');
    }
}

module.exports = DeliveryTimingSettings;

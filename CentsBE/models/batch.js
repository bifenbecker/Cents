const Model = require('./index');

class Batch extends Model {
    static get tableName() {
        return 'batches';
    }

    static get idColumn() {
        return 'id';
    }
    static get relationMappings() {
        const Device = require('./device');
        const Store = require('./store');
        const LaundromatBusiness = require('./laundromatBusiness');

        return {
            devices: {
                relation: Model.HasManyRelation,
                modelClass: Device,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Device.tableName}.batchId`,
                },
            },

            store: {
                relation: Model.BelongsToOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
                },
            },

            business: {
                relation: Model.HasOneThroughRelation,
                modelClass: LaundromatBusiness,
                join: {
                    from: `${this.tableName}.id`,
                    through: {
                        from: `${Device.tableName}.batchId`,
                        to: `${Device.tableName}.businessId`,
                    },
                    to: `${LaundromatBusiness.tableName}.id`,
                },
            },
        };
    }

    getBusiness() {
        return this.$relatedQuery('business');
    }
}

module.exports = Batch;

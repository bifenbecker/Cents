const Model = require('./index');

class StorePromotionProgram extends Model {
    static get tableName() {
        return 'storePromotionPrograms';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const LaundromatBusiness = require('./laundromatBusiness');
        const Store = require('./store');
        const BusinessPromotionProgram = require('./businessPromotionProgram');

        return {
            business: {
                relation: Model.BelongsToOneRelation,
                modelClass: LaundromatBusiness,
                join: {
                    from: `${this.tableName}.businessId`,
                    to: `${LaundromatBusiness.tableName}.id`,
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

            businessPromotionProgram: {
                relation: Model.BelongsToOneRelation,
                modelClass: BusinessPromotionProgram,
                join: {
                    from: `${this.tableName}.businessPromotionProgramId`,
                    to: `${BusinessPromotionProgram.tableName}.id`,
                },
            },
        };
    }

    getBusiness() {
        return this.$relatedQuery('business');
    }
}

module.exports = StorePromotionProgram;

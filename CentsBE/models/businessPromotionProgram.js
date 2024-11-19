const Model = require('./index');

class BusinessPromotionProgram extends Model {
    static get tableName() {
        return 'businessPromotionPrograms';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const LaundromatBusiness = require('./laundromatBusiness');
        const StorePromotionProgram = require('./storePromotionProgram');
        const PromotionProgramItem = require('./promotionProgramItem');

        return {
            business: {
                relation: Model.BelongsToOneRelation,
                modelClass: LaundromatBusiness,
                join: {
                    from: `${this.tableName}.businessId`,
                    to: `${LaundromatBusiness.tableName}.id`,
                },
            },

            storePromotions: {
                relation: Model.HasManyRelation,
                modelClass: StorePromotionProgram,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${StorePromotionProgram.tableName}.businessPromotionProgramId`,
                },
            },

            promotionItems: {
                relation: Model.HasManyRelation,
                modelClass: PromotionProgramItem,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${PromotionProgramItem.tableName}.businessPromotionProgramId`,
                },
            },
        };
    }

    getBusiness() {
        return this.$relatedQuery('business');
    }

    getStorePromotions() {
        return this.$relatedQuery('storePromotions');
    }

    getPromotionItems() {
        return this.$relatedQuery('promotionItems');
    }
}

module.exports = BusinessPromotionProgram;

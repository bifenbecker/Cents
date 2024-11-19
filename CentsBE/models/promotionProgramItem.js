const Model = require('./index');

class PromotionProgramItem extends Model {
    static get tableName() {
        return 'promotionProgramItems';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const LaundromatBusiness = require('./laundromatBusiness');
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

module.exports = PromotionProgramItem;

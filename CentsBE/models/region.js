const Model = require('./index');

class Region extends Model {
    static get tableName() {
        return 'regions';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const District = require('./district');
        const LaundromatBusiness = require('./laundromatBusiness');

        return {
            districts: {
                relation: Model.HasManyRelation,
                modelClass: District,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${District.tableName}.regionId`,
                },
            },

            business: {
                relation: Model.BelongsToOneRelation,
                modelClass: LaundromatBusiness,
                join: {
                    from: `${this.tableName}.businessId`,
                    to: `${LaundromatBusiness.tableName}.id`,
                },
            },
        };
    }

    getDistricts() {
        return this.$relatedQuery('districts');
    }

    getBusiness() {
        return this.$relatedQuery('business');
    }
}

module.exports = Region;

const Model = require('./index');

class ServiceCategories extends Model {
    static get tableName() {
        return 'serviceCategories';
    }

    static get idColumn() {
        return 'id';
    }

  static get relationMappings() {
    const Business = require("./laundromatBusiness");
    const Services = require("./services");
    const ServiceCategoryType = require('./serviceCategoryType');

    return {
      business: {
        relation: Model.BelongsToOneRelation,
        modelClass: Business,
        join: {
          from: `${this.tableName}.businessId`,
          to: `${Business.tableName}.id`,
        },
      },
      services: {
        relation: Model.HasManyRelation,
        modelClass: Services,
        join: {
          from: `${this.tableName}.id`,
          to: `${Services.tableName}.serviceCategoryId`,
        },
      },
      serviceCategoryType: {
        relation: Model.BelongsToOneRelation,
        modelClass: ServiceCategoryType,
        join: {
          from: `${this.tableName}.serviceCategoryTypeId`,
          to: `${ServiceCategoryType.tableName}.id`,
        },
      },
    };
  }
}

module.exports = ServiceCategories;

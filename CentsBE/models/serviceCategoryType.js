const Model = require("./index");

class ServiceCategoryType extends Model {
  static get tableName() {
    return "serviceCategoryTypes";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {
    const ServiceCategory = require('./serviceCategories');

    return {
      serviceCategories: {
        relation: Model.HasManyRelation,
        modelClass: ServiceCategory,
        join: {
          from: `${this.tableName}.id`,
          to: `${ServiceCategory.tableName}.serviceCategoryTypeId`,
        },
      },
    };
  }
}

module.exports = ServiceCategoryType;

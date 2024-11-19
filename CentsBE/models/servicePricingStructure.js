const Model = require("./index");

class ServicePricingStructure extends Model {
  static get tableName() {
    return "servicePricingStructure";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {
    const Service = require('./services');

    return {
      services: {
        relation: Model.HasManyRelation,
        modelClass: Service,
        join: {
          from: `${this.tableName}.id`,
          to: `${Service.tableName}.servicePricingStructureId`,
        },
      },
    };
  }
}

module.exports = ServicePricingStructure;

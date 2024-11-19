const Model = require('./index');

class Modifier extends Model {
    static get tableName() {
        return 'modifiers';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeUpdate() {
        if (!this.updatedAt) {
            this.updatedAt = new Date().toISOString();
        }
    }

    static get relationMappings() {
        const Service = require('./services');
        const ServiceModifier = require('./serviceModifiers');
        return {
            services: {
                relation: Model.ManyToManyRelation,
                modelClass: Service,
                join: {
                    from: `${this.tableName}.id`,
                    through: {
                        from: `${ServiceModifier.tableName}.modifierId`,
                        to: `${ServiceModifier.tableName}.serviceId`,
                        extra: ['isFeatured'],
                    },
                    to: `${Service.tableName}.id`,
                },
            },

            serviceModifiers: {
                relation: Model.HasManyRelation,
                modelClass: ServiceModifier,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceModifier.tableName}.modifierId`,
                },
            },
        };
    }
}

module.exports = exports = Modifier;

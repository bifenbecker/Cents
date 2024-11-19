const Model = require('./index');

const ServiceReferenceItemDetail = require('./serviceReferenceItemDetail');
const Modifier = require('./modifiers');
const ModifierVersion = require('./modifierVersions');

class ServiceReferenceItemDetailModifier extends Model {
    static get tableName() {
        return 'serviceReferenceItemDetailModifiers';
    }

    $beforeUpdate() {
        if (this.updatedAt) {
            this.updatedAt = new Date().toISOString();
        }
    }

    static get relationMappings() {
        return {
            lineItem: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceReferenceItemDetail,
                join: {
                    from: `${this.tableName}.serviceReferenceItemDetailId`,
                    to: `${ServiceReferenceItemDetail.tableName}.id`,
                },
            },

            modifier: {
                relation: Model.HasOneRelation,
                modelClass: Modifier,
                join: {
                    from: `${this.tableName}.modifierId`,
                    to: `${Modifier.tableName}.id`,
                },
            },

            modifierVersion: {
                relation: Model.HasOneRelation,
                modelClass: ModifierVersion,
                join: {
                    from: `${this.tableName}.modifierVersionId`,
                    to: `${ModifierVersion.tableName}.id`,
                }
            }
        };
    }
}

module.exports = exports = ServiceReferenceItemDetailModifier;

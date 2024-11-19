const Model = require('./index');

class PartnerEntity extends Model {
    static get tableName() {
        return 'partnerEntities';
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
        const PartnerSubsidiary = require('./partnerSubsidiary');

        return {
            subsidiaries: {
                relation: Model.HasManyRelation,
                modelClass: PartnerSubsidiary,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${PartnerSubsidiary.tableName}.partnerEntityId`,
                },
            },
        };
    }
}

module.exports = exports = PartnerEntity;

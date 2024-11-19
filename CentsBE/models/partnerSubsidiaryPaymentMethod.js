const Model = require('./index');

class PartnerSubsidiaryPaymentMethod extends Model {
    static get tableName() {
        return 'partnerSubsidiaryPaymentMethods';
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
            partnerSubsidiary: {
                relation: Model.BelongsToOneRelation,
                modelClass: PartnerSubsidiary,
                join: {
                    from: `${this.tableName}.partnerSubsidiaryId`,
                    to: `${PartnerSubsidiary.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = PartnerSubsidiaryPaymentMethod;

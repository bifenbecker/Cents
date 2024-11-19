const Model = require('./index');

class PartnerSubsidiary extends Model {
    static get tableName() {
        return 'partnerSubsidiaries';
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
        const PartnerEntity = require('./partnerEntity');
        const Store = require('./store');
        const PartnerSubsidiaryStore = require('./partnerSubsidiaryStore');
        const PartnerSubsidiaryPaymentMethod = require('./partnerSubsidiaryPaymentMethod');

        return {
            partnerEntity: {
                relation: Model.BelongsToOneRelation,
                modelClass: PartnerEntity,
                join: {
                    from: `${this.tableName}.partnerEntityId`,
                    to: `${PartnerEntity.tableName}.id`,
                },
            },

            store: {
                relation: Model.HasOneThroughRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.id`,
                    through: {
                        from: `${PartnerSubsidiaryStore.tableName}.partnerSubsidiaryId`,
                        to: `${PartnerSubsidiaryStore.tableName}.storeId`,
                    },
                    to: `${Store.tableName}.id`,
                },
            },

            paymentMethods: {
                relation: Model.HasManyRelation,
                modelClass: PartnerSubsidiaryPaymentMethod,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${PartnerSubsidiaryPaymentMethod.tableName}.partnerSubsidiaryId`,
                },
            },
        };
    }
}

module.exports = exports = PartnerSubsidiary;

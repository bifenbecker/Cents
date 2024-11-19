const Model = require('./index');

class PartnerSubsidiaryStore extends Model {
    static get tableName() {
        return 'partnerSubsidiaryStores';
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
        const Store = require('./store');
        const PartnerSubsidiary = require('./partnerSubsidiary');

        return {
            store: {
                relation: Model.HasOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
                },
            },

            partnerSubsidiary: {
                relation: Model.HasOneRelation,
                modelClass: PartnerSubsidiary,
                join: {
                    from: `${this.tableName}.partnerSubsidiaryId`,
                    to: `${PartnerSubsidiary.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = PartnerSubsidiaryStore;

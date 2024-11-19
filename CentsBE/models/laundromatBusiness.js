const Model = require('./index');
const TipSetting = require('./tipSettings');
const BusinessTheme = require('./businessTheme');

const createCategories = require('../services/washServices/categories');
class LaundromatBusiness extends Model {
    static get tableName() {
        return 'laundromatBusiness';
    }

    static get idColumn() {
        return 'id';
    }

    async $afterInsert(queryContext) {
        await BusinessTheme.query(queryContext.transaction).insert({
            businessId: this.id,
        });
        await createCategories(this.id, queryContext.transaction);
    }

    static get relationMappings() {
        const Device = require('./device');
        const User = require('./user');
        const Batch = require('./batch');
        const Store = require('./store');
        const Region = require('./region');
        const Task = require('./tasks');
        const StoreCustomer = require('./storeCustomer');
        const BusinessPromotionProgram = require('./businessPromotionProgram');
        const BusinessSettings = require('./businessSettings');
        const TipSettings = require('./tipSettings');
        const EsdReader = require('./esdReader');
        const SubscriptionProduct = require('./subscriptionProduct');
        const BusinessSubscription = require('./businessSubscription');
        const TermsOfServiceLog = require('./termsOfServiceLog');
        const BusinessTheme = require('./businessTheme');
        const ConvenienceFee = require('./convenienceFee');
        const BagNoteTag = require('./bagNoteTag');

        return {
            locations: {
                relation: Model.HasManyRelation,
                modelClass: Store,
                join: {
                    from: 'laundromatBusiness.id',
                    to: `${Store.tableName}.businessId`,
                },
            },

            devices: {
                relation: Model.HasManyRelation,
                modelClass: Device,
                join: {
                    from: 'laundromatBusiness.id',
                    to: `${Device.tableName}.businessId`,
                },
            },

            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: 'laundromatBusiness.userId',
                    to: `${User.tableName}.id`,
                },
            },

            batches: {
                relation: Model.HasManyRelation,
                modelClass: Batch,
                join: {
                    from: 'laundromatBusiness.id',
                    to: `${Batch.tableName}.businessId`,
                },
            },

            stores: {
                relation: Model.HasManyRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Store.tableName}.businessId`,
                },
            },

            regions: {
                relation: Model.HasManyRelation,
                modelClass: Region,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Region.tableName}.businessId`,
                },
            },

            tasks: {
                relation: Model.HasManyRelation,
                modelClass: Task,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Task.tableName}.businessId`,
                },
            },

            storeCustomers: {
                relation: Model.HasManyRelation,
                modelClass: StoreCustomer,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${StoreCustomer.tableName}.businessId`,
                },
            },

            promotionPrograms: {
                relation: Model.HasManyRelation,
                modelClass: BusinessPromotionProgram,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${BusinessPromotionProgram.tableName}.businessId`,
                },
            },

            settings: {
                relation: Model.HasOneRelation,
                modelClass: BusinessSettings,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${BusinessSettings.tableName}.businessId`,
                },
            },

            tipSetting: {
                relation: Model.HasOneThroughRelation,
                modelClass: TipSettings,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${TipSettings.tableName}.businessId`,
                },
            },

            esdReaders: {
                relation: Model.ManyToManyRelation,
                modelClass: EsdReader,
                join: {
                    from: `${this.tableName}.id`,
                    through: {
                        from: `${Store.tableName}.businessId`,
                        to: `${Store.tableName}.id`,
                    },
                    to: `${EsdReader.tableName}.storeId`,
                },
            },

            subscriptionProducts: {
                relation: Model.HasManyRelation,
                modelClass: SubscriptionProduct,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${SubscriptionProduct.tableName}.businessId`,
                },
            },

            subscription: {
                relation: Model.HasOneRelation,
                modelClass: BusinessSubscription,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${BusinessSubscription.tableName}.businessId`,
                },
            },

            termsOfServiceLog: {
                relation: Model.HasOneRelation,
                modelClass: TermsOfServiceLog,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${TermsOfServiceLog.tableName}.businessId`,
                },
            },

            businessTheme: {
                relation: Model.HasOneRelation,
                modelClass: BusinessTheme,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${BusinessTheme.tableName}.businessId`,
                },
            },

            convenienceFee: {
                relation: Model.HasOneRelation,
                modelClass: ConvenienceFee,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ConvenienceFee.tableName}.businessId`,
                },
            },

            bagNoteTags: {
                relation: Model.HasManyRelation,
                modelClass: BagNoteTag,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${BagNoteTag.tableName}.businessId`,
                },
            },
        };
    }

    getLocations() {
        return this.$relatedQuery('locations');
    }

    getRegions() {
        return this.$relatedQuery('regions');
    }

    getTasks() {
        return this.$relatedQuery('tasks');
    }

    getBatches() {
        return this.$relatedQuery('batches');
    }

    getStoreCustomers() {
        return this.$relatedQuery('storeCustomers');
    }

    getPromotionPrograms() {
        return this.$relatedQuery('promotionPrograms');
    }

    getEsdReaders() {
        return this.$relatedQuery('esdReaders');
    }

    getSubscriptionProducts() {
        return this.$relatedQuery('subscriptionProducts');
    }

    getBusinessOwner() {
        return this.$relatedQuery('user');
    }

    getTermsOfServiceLog() {
        return this.$relatedQuery('termsOfServiceLog');
    }

    getBusinessTheme() {
        return this.$relatedQuery('businessTheme');
    }

    getConvenienceFee() {
        return this.$relatedQuery('convenienceFee');
    }

    getBagNoteTags() {
        return this.$relatedQuery('bagNoteTags');
    }
}

module.exports = LaundromatBusiness;

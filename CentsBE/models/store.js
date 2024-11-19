const argon2 = require('argon2');
const Model = require('./index');
const { locationType } = require('./../constants/constants');
const StoreTheme = require('./storeTheme');
const StoreSettings = require('./storeSettings');
class Store extends Model {
    static get tableName() {
        return 'stores';
    }

    static get idColumn() {
        return 'id';
    }

    async $beforeInsert() {
        if (this.password) {
            this.password = await argon2.hash(this.password);
            this.passwordResetDate = new Date().toISOString();
        }
    }

    async $beforeUpdate() {
        if (this.password) {
            this.password = await argon2.hash(this.password);
            this.passwordResetDate = new Date().toISOString();
        }
        this.updatedAt = new Date().toISOString();
    }

    async $afterInsert(queryContext) {
        await StoreTheme.query(queryContext.transaction).insert({
            businessId: this.businessId,
            storeId: this.id,
        });
        await StoreSettings.query(queryContext.transaction).insert({
            storeId: this.id,
        });
    }

    get addressString() {
        return `${this.address}, ${this.city}, ${this.state}, US, ${this.zipCode}`;
    }
    static get relationMappings() {
        const LaundromatBusiness = require('./laundromatBusiness');
        const Batch = require('./batch');
        const Machine = require('./machine');
        const Shift = require('./shifts');
        const District = require('./district');
        const ServiceOrder = require('./serviceOrders');
        const servicePrice = require('./servicePrices');
        const InventoryItem = require('./inventoryItem');
        const TaxRate = require('./taxRate');
        const StoreCustomer = require('./storeCustomer');
        const StorePromotionProgram = require('./storePromotionProgram');
        const EsdReader = require('./esdReader');
        const OrderDelivery = require('./orderDelivery');
        const StoreTheme = require('./storeTheme');
        const CciSettings = require('./cciSetting');
        const Settings = require('./storeSettings');
        const OwnDeliverySettings = require('./ownDeliverySettings');
        const CentsDeliverySettings = require('./centsDeliverySettings');
        const ScaleDeviceStoreMap = require('./scaleDeviceStoreMap');
        const ScaleDevice = require('./scaleDevice');
        const CashOutEvent = require('./cashOutEvent');
        const CashDrawerStartEvent = require('./cashDrawerStartEvent');
        const CashDrawerEndEvent = require('./cashDrawerEndEvent');
        const Route = require('./route');
        const RouteDelivery = require('./routeDeliveries');
        const PartnerSubsidiary = require('./partnerSubsidiary');
        const PartnerSubsidiaryStore = require('./partnerSubsidiaryStore');
        const PrinterStoreSettings = require('./printerStoreSettings');
        const Turn = require('./turns');
        const LaundroworksSettings = require('./laundroworksSettings');
        const Order = require('./orders');
        const SpyderWashSettings = require('./spyderWashSettings');

        return {
            hub: {
                relation: Model.HasOneRelation,
                modelClass: this,
                join: {
                    from: `${this.tableName}.hubId`,
                    to: `${this.tableName}.id`,
                },
            },

            machines: {
                relation: Model.HasManyRelation,
                modelClass: Machine,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Machine.tableName}.storeId`,
                },
            },

            shifts: {
                relation: Model.HasManyRelation,
                modelClass: Shift,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Shift.tableName}.storeId`,
                },
            },

            laundromatBusiness: {
                relation: Model.BelongsToOneRelation,
                modelClass: LaundromatBusiness,
                join: {
                    from: `${this.tableName}.businessId`,
                    to: `${LaundromatBusiness.tableName}.id`,
                },
            },

            batches: {
                relation: Model.HasManyRelation,
                modelClass: Batch,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Batch.tableName}.storeId`,
                },
            },

            district: {
                relation: Model.HasOneRelation,
                modelClass: District,
                join: {
                    from: `${this.tableName}.districtId`,
                    to: `${District.tableName}.id`,
                },
            },

            orders: {
                relation: Model.HasManyRelation,
                modelClass: ServiceOrder,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceOrder.tableName}.storeId`,
                },
            },

            hubOrders: {
                relation: Model.HasManyRelation,
                modelClass: ServiceOrder,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceOrder.tableName}.hubId`,
                },
            },

            assignedLocations: {
                relation: Model.HasManyRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${this.tableName}.hubId`,
                },
            },
            prices: {
                relation: Model.HasManyRelation,
                modelClass: servicePrice,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${servicePrice.tableName}.storeId`,
                },
            },

            inventoryItems: {
                relation: Model.HasManyRelation,
                modelClass: InventoryItem,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${InventoryItem.tableName}.storeId`,
                },
            },

            taxRate: {
                relation: Model.HasOneRelation,
                modelClass: TaxRate,
                join: {
                    from: `${this.tableName}.taxRateId`,
                    to: `${TaxRate.tableName}.id`,
                },
            },

            storeCustomers: {
                relation: Model.HasManyRelation,
                modelClass: StoreCustomer,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${StoreCustomer.tableName}.storeId`,
                },
            },

            storePromotionPrograms: {
                relation: Model.HasManyRelation,
                modelClass: StorePromotionProgram,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${StorePromotionProgram.tableName}.storeId`,
                },
            },

            esdReaders: {
                relation: Model.HasManyRelation,
                modelClass: EsdReader,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${EsdReader.tableName}.storeId`,
                },
            },

            orderDeliveries: {
                relation: Model.HasManyRelation,
                modelClass: OrderDelivery,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${OrderDelivery.tableName}.storeId`,
                },
            },

            storeTheme: {
                relation: Model.HasOneRelation,
                modelClass: StoreTheme,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${StoreTheme.tableName}.storeId`,
                },
            },

            cciSettings: {
                relation: Model.HasOneRelation,
                modelClass: CciSettings,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${CciSettings.tableName}.storeId`,
                },
            },

            settings: {
                relation: Model.HasOneRelation,
                modelClass: Settings,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Settings.tableName}.storeId`,
                },
            },

            ownDelivery: {
                relation: Model.HasOneRelation,
                modelClass: OwnDeliverySettings,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${OwnDeliverySettings.tableName}.storeId`,
                },
            },

            centsDelivery: {
                relation: Model.HasOneRelation,
                modelClass: CentsDeliverySettings,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${CentsDeliverySettings.tableName}.storeId`,
                },
            },

            scaleDevices: {
                relation: Model.HasManyRelation,
                modelClass: ScaleDevice,
                join: {
                    from: `${this.tableName}.id`,
                    through: {
                        from: `${ScaleDeviceStoreMap.tableName}.storeId`,
                        to: `${ScaleDeviceStoreMap.tableName}.scaleDeviceId`,
                    },
                    to: `${ScaleDevice.tableName}.id`,
                },
            },
            cashOutEvents: {
                relation: Model.HasManyRelation,
                modelClass: CashOutEvent,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${CashOutEvent.tableName}.storeId`,
                },
            },

            cashDrawerStartEvents: {
                relation: Model.HasManyRelation,
                modelClass: CashDrawerStartEvent,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${CashDrawerStartEvent.tableName}.storeId`,
                },
            },

            cashDrawerEndEvents: {
                relation: Model.HasManyRelation,
                modelClass: CashDrawerEndEvent,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${CashDrawerEndEvent.tableName}.storeId`,
                },
            },
            routes: {
                relation: Model.HasManyRelation,
                modelClass: Route,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Route.tableName}.storeId`,
                },
            },

            routeDelivery: {
                relation: Model.HasOneRelation,
                modelClass: RouteDelivery,
                filter(builder) {
                    builder
                        .whereNot(`${RouteDelivery.tableName}.status`, 'CANCELLED')
                        .andWhere(`${RouteDelivery.tableName}.routableType`, 'Store');
                },
                join: {
                    from: `${this.tableName}.id`,
                    to: `${RouteDelivery.tableName}.routableId`,
                },
            },

            partnerSubsidiaries: {
                relation: Model.HasManyRelation,
                modelClass: PartnerSubsidiary,
                join: {
                    from: `${this.tableName}.id`,
                    through: {
                        from: `${PartnerSubsidiaryStore.tableName}.storeId`,
                        to: `${PartnerSubsidiaryStore.tableName}.partnerSubsidiaryId`,
                    },
                    to: `${PartnerSubsidiary.tableName}.id`,
                },
            },

            printerSettings: {
                relation: Model.HasOneRelation,
                modelClass: PrinterStoreSettings,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${PrinterStoreSettings.tableName}.storeId`,
                },
            },

            turns: {
                relation: Model.HasManyRelation,
                modelClass: Turn,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Turn.tableName}.storeId`,
                },
            },
            laundroworksSettings: {
                relation: Model.HasOneRelation,
                modelClass: LaundroworksSettings,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${LaundroworksSettings.tableName}.storeId`,
                },
            },

            masterOrders: {
                relation: Model.HasManyRelation,
                modelClass: Order,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Order.tableName}.storeId`,
                },
            },

            spyderWashSettings: {
                relation: Model.HasOneRelation,
                modelClass: SpyderWashSettings,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${SpyderWashSettings.tableName}.storeId`,
                },
            },
        };
    }

    getTeamMembers() {
        return this.$relatedQuery('teamMembers');
    }

    getBatches() {
        return this.$relatedQuery('batches');
    }

    getDistrict() {
        return this.$relatedQuery('district');
    }

    getOrders() {
        return this.$relatedQuery('orders');
    }

    getBusiness() {
        return this.$relatedQuery('laundromatBusiness');
    }

    getTaxRate() {
        return this.$relatedQuery('taxRate');
    }

    getStoreCustomers() {
        return this.$relatedQuery('storeCustomers');
    }

    getStorePromotionPrograms() {
        return this.$relatedQuery('storePromotionPrograms');
    }

    getEsdReaders() {
        return this.$relatedQuery('esdReaders');
    }

    isLocationResidential() {
        return this.type === locationType.RESIDENTIAL;
    }

    isLocationStandalone() {
        return this.type === locationType.STANDALONE;
    }

    isLocationHub() {
        return this.type === locationType.HUB;
    }

    isLocationIntakeOnly() {
        return this.type === locationType.INTAKE_ONLY;
    }

    isLocationStore() {
        return this.type === locationType.STORE;
    }

    getStoreTheme() {
        return this.$relatedQuery('storeTheme');
    }

    getCciSettings() {
        return this.$relatedQuery('cciSettings');
    }

    getStoreSettings() {
        return this.$relatedQuery('settings');
    }

    getPrinterSettings() {
        return this.$relatedQuery('printerSettings');
    }

    getLaundroworksSettings() {
        return this.$relatedQuery('laundroworksSettings');
    }

    getSpyderWashSettings() {
        return this.$relatedQuery('spyderWashSettings');
    }
}

module.exports = Store;

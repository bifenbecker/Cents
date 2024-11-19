const { paymentStatuses } = require('../constants/constants');
const Model = require('./index');

class ServiceOrder extends Model {
    static get tableName() {
        return 'serviceOrders';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeInsert() {
        this.balanceDue = this.netOrderTotal;

        if (this.paymentStatus !== paymentStatuses.INVOICING) {
            this.paymentStatus = this.netOrderTotal === 0
                ? paymentStatuses.PAID
                : paymentStatuses.BALANCE_DUE;
        }

        if (this.notes) {
            this.notes = this.notes.trim();
        }
    }

    static get relationMappings() {
        const User = require('./user');
        const StoreCustomer = require('./storeCustomer');
        const Store = require('./store');
        const OrderItems = require('./serviceOrderItem');
        const NotificationLog = require('./orderNotificationLog');
        const activityLog = require('./orderActivityLog');
        const ServiceOrderBags = require('./serviceOrderBags');
        const HangerBundles = require('./hangerBundles');
        const StorageRacks = require('./storageRacks');
        const Orders = require('./orders');
        const BusinessPromotionProgram = require('./businessPromotionProgram');
        const OrderAdjustmentLog = require('./orderAdjustmentLog');
        const ServiceOrderWeight = require('./serviceOrderWeights');
        const ServiceOrderRouteDeliveries = require('./serviceOrderRouteDeliveries');
        const ServiceOrderTurns = require('./serviceOrderTurn');
        const Payment = require('./payment');
        const ConvenienceFee = require('./convenienceFee');
        const PricingTier = require('./pricingTier');
        const ServiceOrderRecurringSubscription = require('./serviceOrderRecurringSubscription');

        return {
            serviceOrderTurns: {
                relation: Model.HasManyRelation,
                modelClass: ServiceOrderTurns,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceOrderTurns.tableName}.serviceOrderId`,
                },
            },
            store: {
                relation: Model.BelongsToOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
                },
            },
            orderItems: {
                filter(builder) {
                    builder.where('deletedAt', null);
                },
                relation: Model.HasManyRelation,
                modelClass: OrderItems,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${OrderItems.tableName}.orderId`,
                },
            },
            customerOrderItems: {
                filter(builder) {
                    builder.where('customerSelection', true);
                },
                relation: Model.HasManyRelation,
                modelClass: OrderItems,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${OrderItems.tableName}.orderId`,
                },
            },
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: `${this.tableName}.userId`,
                    to: `${User.tableName}.id`,
                },
            },
            storeCustomer: {
                relation: Model.BelongsToOneRelation,
                modelClass: StoreCustomer,
                join: {
                    from: `${this.tableName}.storeCustomerId`,
                    to: `${StoreCustomer.tableName}.id`,
                },
            },
            notificationLogs: {
                relation: Model.HasManyRelation,
                modelClass: NotificationLog,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${NotificationLog.tableName}.orderId`,
                },
            },
            activityLog: {
                filter(builder) {
                    builder.where('deletedAt', null);
                },
                relation: Model.HasManyRelation,
                modelClass: activityLog,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${activityLog.tableName}.orderId`,
                },
            },
            adjustmentLog: {
                relation: Model.HasManyRelation,
                modelClass: OrderAdjustmentLog,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${OrderAdjustmentLog.tableName}.serviceOrderId`,
                },
            },
            payments: {
                relation: Model.HasManyRelation,
                modelClass: Payment,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Payment.tableName}.orderId`,
                },
            },
            hub: {
                relation: Model.BelongsToOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.hubId`,
                    to: `${Store.tableName}.id`,
                },
            },
            serviceOrderBags: {
                relation: Model.HasManyRelation,
                modelClass: ServiceOrderBags,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceOrderBags.tableName}.serviceOrderId`,
                },
            },
            hangerBundles: {
                relation: Model.HasManyRelation,
                modelClass: HangerBundles,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${HangerBundles.tableName}.serviceOrderId`,
                },
            },
            storageRacks: {
                relation: Model.BelongsToOneRelation,
                modelClass: StorageRacks,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${StorageRacks.tableName}.serviceOrderId`,
                },
            },
            order: {
                relation: Model.BelongsToOneRelation,
                modelClass: Orders,
                filter(builder) {
                    builder.whereIn('orderableType', ['ServiceOrder', 'serviceOrder']);
                },
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Orders.tableName}.orderableId`,
                },
            },
            promotion: {
                relation: Model.BelongsToOneRelation,
                modelClass: BusinessPromotionProgram,
                join: {
                    from: `${this.tableName}.promotionId`,
                    to: `${BusinessPromotionProgram.tableName}.id`,
                },
            },
            weightLogs: {
                relation: Model.HasManyRelation,
                modelClass: ServiceOrderWeight,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceOrderWeight.tableName}.serviceOrderId`,
                },
            },
            serviceOrderRouteDeliveries: {
                relation: Model.HasManyRelation,
                modelClass: ServiceOrderRouteDeliveries,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceOrderRouteDeliveries.tableName}.serviceOrderId`,
                },
            },
            serviceOrderRecurringSubscription: {
                relation: Model.HasOneRelation,
                modelClass: ServiceOrderRecurringSubscription,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceOrderRecurringSubscription.tableName}.serviceOrderId`,
                },
            },
            convenienceFeeDetails: {
                relation: Model.BelongsToOneRelation,
                modelClass: ConvenienceFee,
                join: {
                    from: `${this.tableName}.convenienceFeeId`,
                    to: `${ConvenienceFee.tableName}.id`,
                },
            },
            tier: {
                relation: Model.BelongsToOneRelation,
                modelClass: PricingTier,
                join: {
                    from: `${this.tableName}.tierId`,
                    to: `${PricingTier.tableName}.id`,
                },
            }
        };
    }

    /* getUser() {
        return this.$relatedQuery('user');
    } */
    getCustomer() {
        return this.$relatedQuery('storeCustomer');
    }

    getTotalPaid() {
        return Number((Number(this.netOrderTotal) - Number(this.balanceDue)).toFixed(2));
    }

    get isOnline() {
        return this.orderType === 'ONLINE';
    }

    get isResidential() {
        return this.orderType === 'RESIDENTIAL';
    }

    get isWalkin() {
        return this.orderType === 'SERVICE';
    }

    get isCancelled() {
        return ['CANCELLED', 'CANCELED'].includes(this.status);
    }

    static async afterUpdate(args) {
        const { asFindQuery, transaction, inputItems, context } = args;
        if (context.afterUpdateHookCancel) {
            return;
        }
        const serviceOrders = await asFindQuery(transaction).select();
        const serviceOrderId = serviceOrders[0].id;
        const ServiceOrderQuery = require('../services/queries/serviceOrder');
        const serviceOrderQuery = new ServiceOrderQuery(serviceOrderId, transaction);
        await serviceOrderQuery.updatePaymentStatus();
    }

    $beforeUpdate() {
        if (this.notes) {
            this.notes = this.notes.trim();
        }
    }
}

module.exports = ServiceOrder;

const Model = require('./index');
const {
    routeDeliveryStatuses,
    orderDeliveryStatuses,
    deliveryProviders,
} = require('../constants/constants');

class OrderDelivery extends Model {
    static get tableName() {
        return 'orderDeliveries';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    }

    static async afterUpdate(args) {
        const { cancelDoordashDeliveryQueue } = require('../appQueues');

        const { transaction } = args;
        const orderDeliveries = await args.asFindQuery(transaction).select();

        if (orderDeliveries.length) {
            await Promise.all(
                orderDeliveries.map((delivery) => {
                    if (delivery.status === orderDeliveryStatuses.CANCELED && delivery.thirdPartyDeliveryId && delivery.deliveryProvider === deliveryProviders.DOORDASH) {
                        cancelDoordashDeliveryQueue.add('cancelDoordashDeliveryQueue', {
                            orderDeliveryId: delivery.id,
                        });
                    }
                }),
            );
        }
    }



    static get relationMappings() {
        const Store = require('./store');
        const Order = require('./orders');
        const StoreCustomer = require('./storeCustomer');
        const RouteDelivery = require('./routeDeliveries');
        const CentsCustomerAddress = require('./centsCustomerAddress');
        const Timings = require('./timings');
        return {
            store: {
                relation: Model.BelongsToOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
                },
            },
            order: {
                relation: Model.BelongsToOneRelation,
                modelClass: Order,
                join: {
                    from: `${this.tableName}.orderId`,
                    to: `${Order.tableName}.id`,
                },
            },
            customer: {
                relation: Model.BelongsToOneRelation,
                modelClass: StoreCustomer,
                join: {
                    from: `${this.tableName}.storeCustomerId`,
                    to: `${StoreCustomer.tableName}.id`,
                },
            },
            routeDelivery: {
                relation: Model.HasManyRelation,
                modelClass: RouteDelivery,
                filter(builder) {
                    builder
                        .whereNot(
                            `${RouteDelivery.tableName}.status`,
                            routeDeliveryStatuses.CANCELED,
                        )
                        .andWhere(`${RouteDelivery.tableName}.routableType`, 'OrderDelivery');
                },
                join: {
                    from: `${this.tableName}.id`,
                    to: `${RouteDelivery.tableName}.routableId`,
                },
            },
            centsCustomerAddress: {
                relation: Model.BelongsToOneRelation,
                modelClass: CentsCustomerAddress,
                join: {
                    from: `${this.tableName}.centsCustomerAddressId`,
                    to: `${CentsCustomerAddress.tableName}.id`,
                },
            },
            timing: {
                relation: Model.BelongsToOneRelation,
                modelClass: Timings,
                join: {
                    from: `${this.tableName}.timingsId`,
                    to: `${Timings.tableName}.id`,
                },
            },
        };
    }

    get isStandard() {
        return this.deliveryProvider === 'OWN_DRIVER';
    }

    get isOnDemand() {
        return !this.isStandard;
    }

    get isScheduled() {
        return this.status === 'SCHEDULED';
    }

    get isCompleted() {
        return this.status === 'COMPLETED';
    }
}

module.exports = OrderDelivery;

const Model = require('./index');
const { orderDeliveryStatuses } = require('../constants/constants');

class Order extends Model {
    static get tableName() {
        return 'orders';
    }
    static get idColumn() {
        return 'id';
    }

    getOrderable() {
        const ServiceOrder = require('./serviceOrders');
        const InventoryOrder = require('./inventoryOrders');
        if (!this.orderableType) return undefined;
        const OrderableModel = this.orderableType == 'ServiceOrder' ? ServiceOrder : InventoryOrder;
        return OrderableModel ? OrderableModel.query().where('id', this.orderableId) : null;
    }

    getOrderableModelClass() {
        const ServiceOrder = require('./serviceOrders');
        const InventoryOrder = require('./inventoryOrders');
        if (!this.orderableType) return undefined;
        const OrderableModel =
            this.orderableType === 'ServiceOrder' ? ServiceOrder : InventoryOrder;
        return OrderableModel || null;
    }

    // async $afterGet() {
    //     this.orderable = await this.getOrderable();
    // }

    static get relationMappings() {
        const Store = require('./store');
        const Payment = require('./payment');
        const PromotionDetails = require('./orderPromoDetail');
        const OrderDelivery = require('./orderDelivery');
        const ServiceOrders = require('./serviceOrders');
        const Turn = require('./turns');

        return {
            store: {
                relation: Model.BelongsToOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
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

            promotionDetails: {
                relation: Model.HasOneRelation,
                modelClass: PromotionDetails,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${PromotionDetails.tableName}.orderId`,
                },
            },

            delivery: {
                relation: Model.HasOneRelation,
                modelClass: OrderDelivery,
                filter(builder) {
                    builder
                        .where('type', 'RETURN')
                        .andWhere('status', '!=', orderDeliveryStatuses.FAILED)
                        .andWhere('status', '!=', orderDeliveryStatuses.CANCELED);
                },
                join: {
                    from: `${this.tableName}.id`,
                    to: `${OrderDelivery.tableName}.orderId`,
                },
            },

            allPickup: {
                relation: Model.HasOneRelation,
                modelClass: OrderDelivery,
                filter(builder) {
                    builder.where('type', 'PICKUP')
                },
                join: {
                    from: `${this.tableName}.id`,
                    to: `${OrderDelivery.tableName}.orderId`,
                },
            },

            pickup: {
                relation: Model.HasOneRelation,
                modelClass: OrderDelivery,
                filter(builder) {
                    builder
                        .where('type', 'PICKUP')
                        .andWhere('status', '!=', orderDeliveryStatuses.FAILED)
                        .andWhere('status', '!=', orderDeliveryStatuses.CANCELED);
                },
                join: {
                    from: `${this.tableName}.id`,
                    to: `${OrderDelivery.tableName}.orderId`,
                },
            },

            serviceOrder: {
                relation: Model.HasOneRelation,
                modelClass: ServiceOrders,
                // filter(builder){
                //     builder.whereIn(`${this.tableName}.orderableType`, ['ServiceOrder', 'serviceOrder'])
                // },
                join: {
                    from: `${this.tableName}.orderableId`,
                    to: `${ServiceOrders.tableName}.id`,
                },
            },
            machineOrders: {
                relation: Model.BelongsToOneRelation,
                modelClass: Turn,
                filter(builder) {
                    builder.where(`${this.tableName}.orderableType`, 'Turn');
                },
                join: {
                    from: `${this.tableName}.orderableId`,
                    to: `${Turn.tableName}.id`,
                },
            },
        };
    }
}

module.exports = Order;

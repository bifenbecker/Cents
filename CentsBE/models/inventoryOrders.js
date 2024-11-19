const Model = require('./index');
const { paymentStatuses } = require('../constants/constants');
class InventoryOrder extends Model {
    static get tableName() {
        return 'inventoryOrders';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeInsert() {
        this.balanceDue = this.netOrderTotal;
        this.status = this.netOrderTotal === 0 ? 'COMPLETED' : 'CREATED';

        if (this.paymentStatus !== paymentStatuses.INVOICING) {
            this.paymentStatus = this.netOrderTotal === 0
                ? paymentStatuses.PAID
                : paymentStatuses.BALANCE_DUE;
        }
    }

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    }

    static get relationMappings() {
        const InventoryOrderItems = require('./inventoryOrderItems');
        const Store = require('./store');
        const Customer = require('./storeCustomer');
        const Order = require('./orders');
        const Promotion = require('./businessPromotionProgram');
        const Employee = require('./teamMember');
        return {
            lineItems: {
                relation: Model.HasManyRelation,
                modelClass: InventoryOrderItems,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${InventoryOrderItems.tableName}.inventoryOrderId`,
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
            customer: {
                relation: Model.BelongsToOneRelation,
                modelClass: Customer,
                join: {
                    from: `${this.tableName}.storeCustomerId`,
                    to: `${Customer.tableName}.id`,
                },
            },
            order: {
                relation: Model.HasOneRelation,
                modelClass: Order,
                filter(builder) {
                    builder.where('orderableType', 'InventoryOrder');
                },
                beforeInsert(model) {
                    model.orderableType = 'InventoryOrder';
                },
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Order.tableName}.orderableId`,
                },
            },
            promotion: {
                relation: Model.BelongsToOneRelation,
                modelClass: Promotion,
                join: {
                    from: `${this.tableName}.promotionId`,
                    to: `${Promotion.tableName}.id`,
                },
            },
            employee: {
                relation: Model.BelongsToOneRelation,
                modelClass: Employee,
                join: {
                    from: `${this.tableName}.employeeId`,
                    to: `${Employee.tableName}.id`,
                },
            },
        };
    }
}

module.exports = InventoryOrder;

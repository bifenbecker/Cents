const Model = require('./index');

class Turn extends Model {
    static get tableName() {
        return 'turns';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    }

    static get relationMappings() {
        const Store = require('./store');
        const StoreCustomer = require('./storeCustomer');
        const Machine = require('./machine');
        const Device = require('./device');
        const Orders = require('./orders');
        const TurnLineItems = require('./turnLineItems');
        const MachinePayment = require('./machinePayment');
        const ServiceOrderTurn = require('./serviceOrderTurn');
        const User = require('./user');

        return {
            store: {
                relation: Model.BelongsToOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
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
            machine: {
                relation: Model.BelongsToOneRelation,
                modelClass: Machine,
                join: {
                    from: `${this.tableName}.machineId`,
                    to: `${Machine.tableName}.id`,
                },
            },
            device: {
                relation: Model.BelongsToOneRelation,
                modelClass: Device,
                join: {
                    from: `${this.tableName}.deviceId`,
                    to: `${Device.tableName}.id`,
                },
            },
            order: {
                relation: Model.HasOneRelation,
                modelClass: Orders,
                filter(builder) {
                    builder.where('orderableType', 'Turn');
                },
                beforeInsert(model) {
                    model.orderableType = 'Turn';
                },
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Orders.tableName}.orderableId`,
                },
            },
            turnLineItems: {
                relation: Model.HasManyRelation,
                modelClass: TurnLineItems,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${TurnLineItems.tableName}.turnId`,
                },
            },
            machinePayments: {
                relation: Model.HasManyRelation,
                modelClass: MachinePayment,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${MachinePayment.tableName}.turnId`,
                },
            },
            serviceOrderTurn: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceOrderTurn,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceOrderTurn.tableName}.turnId`,
                },
            },
            createdBy: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: `${this.tableName}.userId`,
                    to: `${User.tableName}.id`,
                },
            },
        };
    }
}

module.exports = Turn;

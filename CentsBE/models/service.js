// const Model = require('./index');

// class Service extends Model {
//     static get tableName() {
//         return 'services';
//     }
//     static get relationMappings() {
//         const OrderItem = require('./orderItem');
//         return {
//             orderItems: {
//                 relation: Model.HasManyRelation,
//                 modelClass: OrderItem,
//                 join: {
//                     from: `${this.tableName}.id`,
//                     to: `${OrderItem.tableName}.serviceId`
//                 }
//             },
//         };
//     }
// }

// module.exports = exports = Service;

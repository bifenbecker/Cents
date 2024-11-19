const Model = require('./index');
class Category extends Model {
    static get tableName() {
        return 'categories';
    }
}

module.exports = Category;

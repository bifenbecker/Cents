const BaseService = require('../base');

class OrderBase extends BaseService {
    constructor(payload) {
        super();
        this.payload = payload;
        this.items = [];
        this.customer = {};
        this.status = null;
        this.promotionDetails = {};
    }
}

module.exports = exports = OrderBase;

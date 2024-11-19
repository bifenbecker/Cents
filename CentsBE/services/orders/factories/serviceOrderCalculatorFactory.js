const PostPayOrderCalculator = require('../calculations/postPayOrderCalculator');
const PrePayOrderCalculator = require('../calculations/prePayOrderClaculator');

class ServiceOrderCalculatorFactory {
    constructor(payload, promotionDetails, orderTotal) {
        this.payload = payload;
        this.promotionDetails = promotionDetails;
        this.orderTotal = orderTotal;
    }

    calculator() {
        if (this.payload.paymentTiming !== 'PRE-PAY') {
            return new PostPayOrderCalculator(this.payload, this.promotionDetails, this.orderTotal);
        }
        return new PrePayOrderCalculator(this.payload, this.promotionDetails, this.orderTotal);
    }
}

module.exports = exports = ServiceOrderCalculatorFactory;

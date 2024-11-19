const { raw } = require('objection');
const BaseService = require('../../base');

const applyToFixed = require('../../../utils/applyToFixed');

const ServiceOrder = require('../../../models/serviceOrders');
const CreditHistory = require('../../../models/creditHistory');

class CreditUpdate extends BaseService {
    constructor(payload) {
        super();
        this.balanceDue = 0;
        this.creditAmount = 0;
        this.payload = payload;
        this.serviceOrder = {};
    }

    buildCredits() {
        const { creditApplied, creditAmount: previouslyAppliedCredits } = this.payload;
        if (!this.isCreditRemoved) {
            this.creditAmount = creditApplied;
        } else {
            this.creditAmount = -previouslyAppliedCredits;
        }
    }

    calculateNetOrderTotal() {
        const { netOrderTotal: previousNetOrderTotal } = this.payload;
        return previousNetOrderTotal - this.creditAmount;
    }

    calculateBalanceDue() {
        const { balanceDue: previousBalanceDue } = this.payload;
        return previousBalanceDue - this.creditAmount;
    }

    get isCreditRemoved() {
        const { type } = this.payload;
        return type === 'REMOVING';
    }

    buildServiceOrderObject() {
        this.serviceOrder.netOrderTotal = applyToFixed(this.calculateNetOrderTotal());
        this.serviceOrder.balanceDue = applyToFixed(this.calculateBalanceDue());
        this.serviceOrder.creditAmount =
            this.creditAmount < 0 ? 0 : applyToFixed(this.creditAmount);
        this.serviceOrder.paymentStatus = this.serviceOrder.balanceDue > 0 ? 'BALANCE_DUE' : 'PAID';
    }

    async updateServiceOrder() {
        await ServiceOrder.query(this.transaction)
            .patch(this.serviceOrder)
            .findById(this.payload.id);
    }

    async addCreditHistory() {
        const {
            storeCustomer: { centsCustomerId: customerId, businessId },
        } = this.payload;
        await CreditHistory.query(this.transaction).insert({
            customerId,
            businessId,
            reasonId: raw('(select id from "creditReasons" where reason = \'Customer Service\')'),
            amount: -this.creditAmount,
        });
    }

    async perform() {
        this.buildCredits();
        this.buildServiceOrderObject();
        await this.updateServiceOrder();
        await this.addCreditHistory();
    }
}

module.exports = exports = CreditUpdate;

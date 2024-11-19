const jwt = require('jsonwebtoken');
const ServiceOrder = require('../../models/serviceOrders');
const StoreCustomer = require('../../models/storeCustomer');

class CustomerService {
    constructor(customer) {
        this.customer = customer;
    }

    async activeOrders() {
        const orders = await ServiceOrder.query()
            .whereNotIn('status', ['CANCELLED', 'COMPLETED'])
            .andWhere('orderType', 'RESIDENTIAL')
            .andWhere('storeCustomerId', this.customer.id)
            .orderBy('id', 'desc');
        return orders;
    }

    async hasPendingOrders() {
        const pendingOrders = await this.activeOrders();
        return pendingOrders && pendingOrders.length > 0;
    }

    async updateNotes(notes) {
        await StoreCustomer.query().patch({ notes }).findById(this.customer.id);
    }

    generateToken() {
        return jwt.sign({ id: this.customer.id }, process.env.JWT_SECRET_TOKEN);
    }

    get name() {
        return `${this.customer.firstName} ${this.customer.lastName}`;
    }

    get language() {
        return this.customer.languageId === 1 ? 'english' : 'spanish';
    }

    get notes() {
        return this.customer.notes ? this.customer.notes : '';
    }

    get phone() {
        return this.customer.phoneNumber;
    }

    get details() {
        const response = {};
        response.id = this.customer.id;
        response.fullName = this.name;
        response.firstName = this.customer.firstName;
        response.lastName = this.customer.lastName;
        response.storeCustomerId = this.customer.id;
        response.centsCustomerId = this.customer.centsCustomer.id;
        response.phoneNumber = this.customer.phoneNumber;
        response.notes = this.notes;
        response.language = this.language;
        response.stripeCustomerId = this.customer.centsCustomer.stripeCustomerId;
        response.hangDryInstructions = this.customer.hangDryInstructions;
        response.isHangDrySelected = this.customer.isHangDrySelected;
        return response;
    }
}

module.exports = CustomerService;

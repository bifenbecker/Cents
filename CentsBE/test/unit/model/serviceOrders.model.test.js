require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const factory = require('../../factories');
const {
    hasAssociation,
    hasTable,
    hasMany,
    belongsToOne,
    hasOne,
} = require('../../support/objectionTestHelper');
const ServiceOrder = require('../../../models/serviceOrders');
const { paymentStatuses } = require('../../../constants/constants');

describe('test serviceOrders model', () => {
    it('should return true if serviceOrders table exists', async () => {
        const hasTableName = await hasTable(ServiceOrder.tableName);
        expect(hasTableName).to.be.true;
    });

    it('serviceOrders should have serviceOrderTurns association', async () => {
        hasAssociation(ServiceOrder, 'serviceOrderTurns');
    });

    it('serviceOrders should have HasManyRelation serviceOrderTurns association', async () => {
        hasMany(ServiceOrder, 'serviceOrderTurns');
    });

    it('serviceOrders should have store association', async () => {
        hasAssociation(ServiceOrder, 'store');
    });

    it('serviceOrders should have BelongsToOneRelation store association', async () => {
        belongsToOne(ServiceOrder, 'store');
    });

    it('serviceOrders should have orderItems association', async () => {
        hasAssociation(ServiceOrder, 'orderItems');
    });

    it('serviceOrders should have HasManyRelation orderItems association', async () => {
        hasMany(ServiceOrder, 'orderItems');
    });

    it('serviceOrders should have customerOrderItems association', async () => {
        hasAssociation(ServiceOrder, 'customerOrderItems');
    });

    it('serviceOrders should have HasManyRelation customerOrderItems association', async () => {
        hasMany(ServiceOrder, 'customerOrderItems');
    });

    it('serviceOrders should have user association', async () => {
        hasAssociation(ServiceOrder, 'user');
    });

    it('serviceOrders should have BelongsToOneRelation user association', async () => {
        belongsToOne(ServiceOrder, 'user');
    });

    it('serviceOrders should have storeCustomer association', async () => {
        hasAssociation(ServiceOrder, 'storeCustomer');
    });

    it('serviceOrders should have BelongsToOneRelation storeCustomer association', async () => {
        belongsToOne(ServiceOrder, 'storeCustomer');
    });

    it('serviceOrders should have notificationLogs association', async () => {
        hasAssociation(ServiceOrder, 'notificationLogs');
    });

    it('serviceOrders should have HasManyRelation notificationLogs association', async () => {
        hasMany(ServiceOrder, 'notificationLogs');
    });

    it('serviceOrders should have activityLog association', async () => {
        hasAssociation(ServiceOrder, 'activityLog');
    });

    it('serviceOrders should have HasManyRelation activityLog association', async () => {
        hasMany(ServiceOrder, 'activityLog');
    });

    it('serviceOrders should have adjustmentLog association', async () => {
        hasAssociation(ServiceOrder, 'adjustmentLog');
    });

    it('serviceOrders should have HasManyRelation adjustmentLog association', async () => {
        hasMany(ServiceOrder, 'adjustmentLog');
    });

    it('serviceOrders should have payments association', async () => {
        hasAssociation(ServiceOrder, 'payments');
    });

    it('serviceOrders should have HasManyRelation payments association', async () => {
        hasMany(ServiceOrder, 'payments');
    });

    it('serviceOrders should have hub association', async () => {
        hasAssociation(ServiceOrder, 'hub');
    });

    it('serviceOrders should have BelongsToOneRelation hub association', async () => {
        belongsToOne(ServiceOrder, 'hub');
    });

    it('serviceOrders should have serviceOrderBags association', async () => {
        hasAssociation(ServiceOrder, 'serviceOrderBags');
    });

    it('serviceOrders should have HasManyRelation serviceOrderBags association', async () => {
        hasMany(ServiceOrder, 'serviceOrderBags');
    });

    it('serviceOrders should have order association', async () => {
        hasAssociation(ServiceOrder, 'order');
    });

    it('serviceOrders should have BelongsToOneRelation order association', async () => {
        belongsToOne(ServiceOrder, 'order');
    });

    it('serviceOrders should have promotion association', async () => {
        hasAssociation(ServiceOrder, 'promotion');
    });

    it('serviceOrders should have BelongsToOneRelation promotion association', async () => {
        belongsToOne(ServiceOrder, 'promotion');
    });

    it('serviceOrders should have weightLogs association', async () => {
        hasAssociation(ServiceOrder, 'weightLogs');
    });

    it('serviceOrders should have HasManyRelation weightLogs association', async () => {
        hasMany(ServiceOrder, 'weightLogs');
    });

    it('serviceOrders should have serviceOrderRouteDeliveries association', async () => {
        hasAssociation(ServiceOrder, 'serviceOrderRouteDeliveries');
    });

    it('serviceOrders should have HasManyRelation serviceOrderRouteDeliveries association', async () => {
        hasMany(ServiceOrder, 'serviceOrderRouteDeliveries');
    });

    it('serviceOrders should have serviceOrderRecurringSubscription association', async () => {
        hasAssociation(ServiceOrder, 'serviceOrderRecurringSubscription');
    });

    it('serviceOrders should have HasOneRelation serviceOrderRecurringSubscription association', async () => {
        hasOne(ServiceOrder, 'serviceOrderRecurringSubscription');
    });

    it('serviceOrders should have convenienceFeeDetails association', async () => {
        hasAssociation(ServiceOrder, 'convenienceFeeDetails');
    });

    it('serviceOrders should have BelongsToOneRelation convenienceFeeDetails association', async () => {
        belongsToOne(ServiceOrder, 'convenienceFeeDetails');
    });

    it('serviceOrders should have tier association', async () => {
        hasAssociation(ServiceOrder, 'tier');
    });

    it('serviceOrders should have BelongsToOneRelation tier association', async () => {
        belongsToOne(ServiceOrder, 'tier');
    });

    it('serviceOrders model should have paymentStatus BALANCE_DUE for beforeInsert hook', async () => {
        const serviceOrder = await factory.create('serviceOrder');

        expect(serviceOrder.paymentStatus).to.not.be.undefined;
        expect(serviceOrder.paymentStatus).to.not.be.null;
        expect(serviceOrder.paymentStatus).to.be.equal(paymentStatuses.BALANCE_DUE);
    });

    it('serviceOrders model should have trimmed notes field for beforeUpdate hook', async () => {
        const serviceOrder = await factory.create('serviceOrder');
        const updatedServiceOrders = await ServiceOrder.query()
            .patch({
                notes: '  text ',
            })
            .findById(serviceOrder.id)
            .returning('*');

        expect(updatedServiceOrders.notes).to.not.be.null;
        expect(updatedServiceOrders.notes).to.not.be.undefined;
        expect(updatedServiceOrders.notes).to.be.equal('text');
    });

    it('serviceOrders model should have paymentStatus PAID with balanceDue equal to 0 for afterUpdate hook', async () => {
        const serviceOrder = await factory.create('serviceOrder');
        await ServiceOrder.query()
            .patch({
                balanceDue: 0,
            })
            .findById(serviceOrder.id);
        const updatedServiceOrder = await ServiceOrder.query()
            .findById(serviceOrder.id)
            .returning('*');

        expect(updatedServiceOrder.paymentStatus).to.not.be.null;
        expect(updatedServiceOrder.paymentStatus).to.not.be.undefined;
        expect(updatedServiceOrder.paymentStatus).to.be.equal(paymentStatuses.PAID);
    });

    it('serviceOrders model should have paymentStatus BALANCE_DUE with balanceDue equal to 15 for afterUpdate hook', async () => {
        const serviceOrder = await factory.create('serviceOrder');
        await ServiceOrder.query()
            .patch({
                balanceDue: 15,
            })
            .findById(serviceOrder.id);
        const updatedServiceOrder = await ServiceOrder.query()
            .findById(serviceOrder.id)
            .returning('*');

        expect(updatedServiceOrder.paymentStatus).to.not.be.null;
        expect(updatedServiceOrder.paymentStatus).to.not.be.undefined;
        expect(updatedServiceOrder.paymentStatus).to.be.equal(paymentStatuses.BALANCE_DUE);
    });
});

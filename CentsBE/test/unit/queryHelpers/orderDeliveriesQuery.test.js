require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const factory = require('../../factories');

const { includeZoneNameInOrderDelivery } = require('../../../queryHelpers/orderDeliveriesQuery');
const OwnDeliverySettings = require('../../../models/ownDeliverySettings');
describe('test includeZoneNameInOrderDelivery', () => {
    let ownDeliverySettings, delivery, order;
    beforeEach(async () => {
        ownDeliverySettings = await factory.create('ownDeliverySetting', {
            hasZones: false,
        });
        const serviceOrder = await factory.create('serviceOrder', {
            storeId: ownDeliverySettings.storeId,
        });
        order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        delivery = await factory.create('orderDelivery', {
            storeId: ownDeliverySettings.storeId,
            orderId: order.id,
        });
    });
    describe('with doordash order delivery', () => {
        beforeEach(async () => {
            delivery.deliveryProvider = 'DOORDASH';
        });
        it('should not include zoneName in the order delivery', async () => {
            await includeZoneNameInOrderDelivery(delivery);
            expect(delivery).not.to.be.haveOwnProperty('zoneName');
        });
    });

    describe('with own driver order delivery', () => {
        describe('without active ownDeliverySettings', () => {
            beforeEach(async () => {
                await OwnDeliverySettings.query()
                    .patch({ active: false })
                    .where({ id: ownDeliverySettings.id });
            });
            it('should not include zoneName in the order delivery', async () => {
                await includeZoneNameInOrderDelivery(delivery);
                expect(delivery).not.to.be.haveOwnProperty('zoneName');
            });
        });
        describe('without zones', () => {
            it('should not include zoneName in the order delivery', async () => {
                await includeZoneNameInOrderDelivery(delivery);
                expect(delivery).not.to.be.haveOwnProperty('zoneName');
            });
        });

        describe('with zones', () => {
            beforeEach(async () => {
                await ownDeliverySettings.$query().patch({ hasZones: true });
                delivery = await factory.create('orderDelivery', {
                    storeId: ownDeliverySettings.storeId,
                    orderId: order.id,
                    postalCode: '19102',
                });
            });
            it('should include zoneName in the order delivery', async () => {
                await factory.create('zone', {
                    ownDeliverySettingsId: ownDeliverySettings.id,
                    name: 'North Bergen',
                    zipCodes: [19102, 19103],
                });
                await includeZoneNameInOrderDelivery(delivery);
                expect(delivery.zoneName).to.be.eq('North Bergen');
            });
            describe('when hasZones is true butzones are empty', () => {
                it('should not include zoneName in the order delivery', async () => {
                    await includeZoneNameInOrderDelivery(delivery);
                    expect(delivery).not.to.be.haveOwnProperty('zoneName');
                });
            });
        });
    });
});

require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { getQueryParamsforServices } = require('../../../helpers/onlineOrderServicesQueryHelper');
const factory = require('../../factories');

const OwnDeliverySettings = require('../../../models/ownDeliverySettings');
const OnDemandDeliverySettings = require('../../../models/centsDeliverySettings');
const StoreSettings = require('../../../models/storeSettings');

describe('test getQueryParamsforServices', () => {
    let businessCustomer, store;
    beforeEach(async () => {
        businessCustomer = await factory.create('businessCustomer');
        store = await factory.create('store', { businessId: businessCustomer.businessId });
    });
    describe('with commertial customer', () => {
        beforeEach(async () => {
            businessCustomer = await factory.create('commercialBusinessCustomer', {
                businessId: businessCustomer.businessId,
            });
        });
        it('should return pricing tier query params', async () => {
            const { queryColumn, queryColumnValue } = await getQueryParamsforServices(
                businessCustomer,
                store.id,
                93101,
            );
            expect(queryColumn).to.eql('pricingTierId');
            expect(queryColumnValue).to.eql(businessCustomer.commercialTierId);
        });
    });
    describe('with non commertial customer', () => {
        describe('with ownDeliverySettings', () => {
            let ownDeliverySettings;
            beforeEach(async () => {
                ownDeliverySettings = await factory.create('ownDeliverySetting', {
                    storeId: store.id,
                });
            });
            describe('without zones', () => {
                describe('with retail pricing', () => {
                    it('should return retial pricing tier query params', async () => {
                        const { queryColumn, queryColumnValue } = await getQueryParamsforServices(
                            businessCustomer,
                            store.id,
                            93101,
                        );
                        expect(queryColumn).to.eql('storeId');
                        expect(queryColumnValue).to.eql(store.id);
                    });
                });
                describe('with delivery tier', () => {
                    let deliveryTier;
                    beforeEach(async () => {
                        deliveryTier = await factory.create('pricingTiers', {
                            businessId: businessCustomer.businessId,
                            type: 'DELIVERY',
                        });
                        await StoreSettings.query()
                            .patch({
                                deliveryTierId: deliveryTier.id,
                                deliveryPriceType: 'DELIVERY_TIER',
                            })
                            .where({ storeId: store.id });
                    });
                    it('should return delivery tier query params', async () => {
                        const { queryColumn, queryColumnValue } = await getQueryParamsforServices(
                            businessCustomer,
                            store.id,
                            93101,
                        );
                        expect(queryColumn).to.eql('pricingTierId');
                        expect(queryColumnValue).to.eql(deliveryTier.id);
                    });
                });
            });
            describe('with zones', () => {
                beforeEach(async () => {
                    await OwnDeliverySettings.query()
                        .patch({ hasZones: true })
                        .where({ storeId: store.id });
                });
                describe('without delivery tier', () => {
                    it('should return retial pricing tier query params', async () => {
                        factory.create('zone', {
                            ownDeliverySettingsId: ownDeliverySettings.id,
                            zipCodes: [93101],
                            deliveryTierId: null,
                        });
                        const { queryColumn, queryColumnValue } = await getQueryParamsforServices(
                            businessCustomer,
                            store.id,
                            93101,
                        );
                        expect(queryColumn).to.eql('storeId');
                        expect(queryColumnValue).to.eql(store.id);
                    });
                });
                describe('with delivery tier', () => {
                    let deliveryTier;
                    beforeEach(async () => {
                        deliveryTier = await factory.create('pricingTiers', {
                            businessId: businessCustomer.businessId,
                            type: 'DELIVERY',
                        });
                        factory.create('zone', {
                            ownDeliverySettingsId: ownDeliverySettings.id,
                            zipCodes: [93101],
                            deliveryTierId: deliveryTier.id,
                        });
                        await StoreSettings.query()
                            .patch({
                                deliveryPriceType: 'DELIVERY_TIER',
                            })
                            .where({ storeId: store.id });
                    });
                    it('should return delivery pricing tier query params', async () => {
                        const { queryColumn, queryColumnValue } = await getQueryParamsforServices(
                            businessCustomer,
                            store.id,
                            93101,
                        );
                        expect(queryColumn).to.eql('pricingTierId');
                        expect(queryColumnValue).to.eql(deliveryTier.id);
                    });
                });
            });
        });

        describe('with onDemandDeliverySettings', () => {
            let onDemandDeliverySettings;
            beforeEach(async () => {
                onDemandDeliverySettings = await factory.create('centsDeliverySettings', {
                    storeId: store.id,
                });
            });
            describe('when doordash not enabled', () => {
                it('should return retial pricing tier query params', async () => {
                    const { queryColumn, queryColumnValue } = await getQueryParamsforServices(
                        businessCustomer,
                        store.id,
                        93101,
                    );
                    expect(queryColumn).to.eql('storeId');
                    expect(queryColumnValue).to.eql(store.id);
                });
            });
            describe('when doordash enabled', () => {
                beforeEach(async () => {
                    await OnDemandDeliverySettings.query()
                        .patch({ doorDashEnabled: true })
                        .where({ id: onDemandDeliverySettings.id });
                });
                describe('without delivery tier', () => {
                    it('should return retial pricing tier query params', async () => {
                        const { queryColumn, queryColumnValue } = await getQueryParamsforServices(
                            businessCustomer,
                            store.id,
                            93101,
                        );
                        expect(queryColumn).to.eql('storeId');
                        expect(queryColumnValue).to.eql(store.id);
                    });
                });
                describe('with delivery tier', () => {
                    let deliveryTier;
                    beforeEach(async () => {
                        deliveryTier = await factory.create('pricingTiers', {
                            businessId: businessCustomer.businessId,
                            type: 'DELIVERY',
                        });
                        await StoreSettings.query()
                            .patch({
                                deliveryPriceType: 'DELIVERY_TIER',
                                deliveryTierId: deliveryTier.id,
                            })
                            .where({ storeId: store.id });
                    });
                    it('should return delivery pricing tier query params', async () => {
                        const { queryColumn, queryColumnValue } = await getQueryParamsforServices(
                            businessCustomer,
                            store.id,
                            93101,
                        );
                        expect(queryColumn).to.eql('pricingTierId');
                        expect(queryColumnValue).to.eql(deliveryTier.id);
                    });
                });
            });
        });

        describe('with both ownDeliverySettings and onDemandDeliverySettings', () => {
            let ownDeliverySettings, onDemandDeliverySettings;
            beforeEach(async () => {
                ownDeliverySettings = await factory.create('ownDeliverySetting', {
                    storeId: store.id,
                });
                onDemandDeliverySettings = await factory.create('centsDeliverySettings', {
                    storeId: store.id,
                });
            });
            describe('without zones', () => {
                describe('without delivery tier', () => {
                    it('should return retial pricing tier query params', async () => {
                        const { queryColumn, queryColumnValue } = await getQueryParamsforServices(
                            businessCustomer,
                            store.id,
                            93101,
                        );
                        expect(queryColumn).to.eql('storeId');
                        expect(queryColumnValue).to.eql(store.id);
                    });
                });
                describe('with delivery tier', () => {
                    let deliveryTier;
                    beforeEach(async () => {
                        deliveryTier = await factory.create('pricingTiers', {
                            businessId: businessCustomer.businessId,
                            type: 'DELIVERY',
                        });
                        await StoreSettings.query()
                            .patch({
                                deliveryTierId: deliveryTier.id,
                                deliveryPriceType: 'DELIVERY_TIER',
                            })
                            .where({ storeId: store.id });
                    });
                    it('should return delivery tier query params', async () => {
                        const { queryColumn, queryColumnValue } = await getQueryParamsforServices(
                            businessCustomer,
                            store.id,
                            93101,
                        );
                        expect(queryColumn).to.eql('pricingTierId');
                        expect(queryColumnValue).to.eql(deliveryTier.id);
                    });
                });
            });
            describe('with zones', () => {
                let deliveryTier1, deliveryTier2;
                beforeEach(async () => {
                    await StoreSettings.query()
                        .patch({
                            deliveryPriceType: 'DELIVERY_TIER',
                        })
                        .where({ storeId: store.id });
                    await OwnDeliverySettings.query()
                        .patch({ hasZones: true })
                        .where({ storeId: store.id });
                    await OnDemandDeliverySettings.query()
                        .patch({ doorDashEnabled: true })
                        .where({ id: onDemandDeliverySettings.id });
                    deliveryTier1 = await factory.create('pricingTiers', {
                        businessId: businessCustomer.businessId,
                        type: 'DELIVERY',
                    });
                    factory.create('zone', {
                        ownDeliverySettingsId: ownDeliverySettings.id,
                        zipCodes: [93101],
                        deliveryTierId: deliveryTier1.id,
                    });
                    deliveryTier2 = await factory.create('pricingTiers', {
                        businessId: businessCustomer.businessId,
                        type: 'DELIVERY',
                    });
                    factory.create('zone', {
                        ownDeliverySettingsId: ownDeliverySettings.id,
                        zipCodes: [93103],
                        deliveryTierId: deliveryTier2.id,
                    });
                });
                describe('when zipcode not belongs to any zones', () => {
                    describe('when doordash enabled', () => {
                        it('should fetch delivery tier from the first zone', async () => {
                            const { queryColumn, queryColumnValue } =
                                await getQueryParamsforServices(businessCustomer, store.id, 93105);
                            expect(queryColumn).to.eql('pricingTierId');
                            expect(queryColumnValue).to.eql(deliveryTier1.id);
                        });
                    });
                    describe('when doordash disabled', () => {
                        beforeEach(async () => {
                            await OnDemandDeliverySettings.query()
                                .patch({ doorDashEnabled: false })
                                .where({ id: onDemandDeliverySettings.id });
                        });
                        it('should return retial pricing tier query params', async () => {
                            const { queryColumn, queryColumnValue } =
                                await getQueryParamsforServices(businessCustomer, store.id, 93105);
                            expect(queryColumn).to.eql('storeId');
                            expect(queryColumnValue).to.eql(store.id);
                        });
                    });
                });
            });
        });
    });
});

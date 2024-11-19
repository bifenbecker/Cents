require('../../../../../testHelper');
const { expect } = require('../../../../../support/chaiHelper');
const factory = require('../../../../../factories');
const getStandardDeliveryWindows = require('../../../../../../uow/liveLink/store/getOwnDriverDeliverySettings/getStandardDeliveryWindows');
const { FACTORIES_NAMES: FN } = require('../../../../../constants/factoriesNames');
const {
    ORDER_DELIVERY_TYPES,
    orderDeliveryStatuses,
    pricingTiersTypes
} = require('../../../../../../constants/constants');
const StoreSettings = require('../../../../../../models/storeSettings');

describe('test getStandardDeliveryWindows UoW', () => {
    const getPayload = async (store) => {
        return {
            storeId: store.id,
            zipCode: store.zipCode,
            timeZone: 'America/Los_Angeles',
            serviceType: 'TECHNICAL_SERVICE',
            startDate: new Date().getTime(),
        }
    };

    let store, payload;

    beforeEach(async () => {
        store = await factory.create(FN.store);

        await StoreSettings.query()
            .where({ processingCapability: 'BASIC' })
            .patch({
                timeZone: 'America/Los_Angeles',
            })
            .returning('*')
    });

    it('should return daywiseDeliveryTimings', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100,
        });

        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });

        const ownDeliverySettings = await factory.create(FN.ownDeliverySetting, {
            storeId: store.id,
            active: true,
            hasZones: true,
        });

        await factory.create(FN.orderDelivery, {
            orderId: order.id,
            type: ORDER_DELIVERY_TYPES.PICKUP,
            status: orderDeliveryStatuses.SCHEDULED,
        });

        const shift = await factory.create(FN.shift, {
            storeId: store.id,
            type: 'OWN_DELIVERY'
        });

        await factory.create(FN.timing, {
            shiftId: shift.id,
        });

        const subscription = await factory.create(FN.recurringSubscription);

        await factory.create(FN.serviceOrderRecurringSubscription, {
            recurringSubscriptionId: subscription.id,
            serviceOrderId: serviceOrder.id,
        });

        const deliveryTier = await factory.create(FN.pricingTier, {
            businessId: store.businessId,
            type: pricingTiersTypes.DELIVERY,
        });

        const zone = await factory.create(FN.zone, {
            ownDeliverySettingsId: ownDeliverySettings.id,
            zipCodes: ownDeliverySettings.zipCodes,
            deliveryTierId: deliveryTier.id
        });

        await factory.create(FN.shiftTimingZone, { zoneIds: [zone.id] });

        const payload = await getPayload(store);

        const res = await getStandardDeliveryWindows(payload);

        expect(res[0]).to.have.property('current_date');
        expect(res[0]).to.have.property('current_date_in_unix');
        expect(res[0]).to.have.property('day');
        expect(res[0]).to.have.property('timings');
    });

    it('should not should return daywiseDeliveryTimings and return null', async () => {
        const payload = await getPayload(store);

        const res = await getStandardDeliveryWindows(payload);

        expect(res).to.be.null;
    });

    it('should fail to get for not passing the payload', async () => {
        payload = {};
        expect(getStandardDeliveryWindows(payload)).rejectedWith(Error);
    });
});
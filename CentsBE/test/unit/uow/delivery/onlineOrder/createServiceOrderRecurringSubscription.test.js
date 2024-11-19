require('../../../../testHelper');
const { cloneDeep } = require('lodash');
const { expect, assert } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const createServiceOrderRecurringSubscription = require('../../../../../uow/delivery/onlineOrder/createServiceOrderRecurringSubscription');
const StoreSettings = require('../../../../../models/storeSettings');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test createServiceOrderRecurringSubscription UoW', () => {
    const paymentToken = 'paymentToken';
    const initialProperty = 'initialProperty';
    const recurringDiscountInPercent = 5;
    let store;
    let payload;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        const settings = await StoreSettings.query().where({ storeId: store.id });
        const centsCustomer = await factory.create(FN.centsCustomerWithAddress);
        const modifier = await factory.create(FN.modifier);
        const recurringSubscription = await factory.create(FN.recurringSubscription, {
            recurringRule: 'DTSTART:20210907T193000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO;INTERVAL=1',
            paymentToken: 'paymentToken',
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
            centsCustomerAddressId: centsCustomer.addresses[0],
            modifierIds: [modifier.id],
            cancelledPickupWindows: null,
        });

        payload = {
            storeId: store.id,
            paymentToken,
            centsCustomer,
            centsCustomerAddressId: centsCustomer.addresses[0],
            settings,
            recurringSubscription,
        };
    });

    it('should return initial payload when recurringSubscription is not exist', async () => {
        payload = { initialProperty };
        const initialPayload = cloneDeep(payload);

        // call UoW
        const newPayload = await createServiceOrderRecurringSubscription(payload);

        // assert
        expect(newPayload).not.have.property('serviceOrderRecurringSubscription');
        assert.deepEqual(newPayload, initialPayload);
    });

    describe('should add new property if recurringSubscription exist', () => {
        it('with COMMERCIAL pricingTier', async () => {
            const pricingTier = await factory.create(FN.pricingTier, {
                businessId: store.businessId,
                type: 'COMMERCIAL',
            });
            const serviceOrder = await factory.create(FN.serviceOrder, {
                tierId: pricingTier.id,
            });
            payload.serviceOrder = serviceOrder;

            // call UoW
            const newPayload = await createServiceOrderRecurringSubscription(payload);

            // assert
            const expectedSub = {
                serviceOrderId: serviceOrder.id,
                recurringSubscriptionId: payload.recurringSubscription.id,
                servicePriceId: payload.recurringSubscription.servicePriceId,
                modifierIds: payload.recurringSubscription.modifierIds,
                pickupWindow: payload.recurringSubscription.pickupWindow,
                recurringDiscountInPercent: 0,
            };
            expect(newPayload).have.property('serviceOrderRecurringSubscription');
            assert.deepOwnInclude(newPayload.serviceOrderRecurringSubscription, expectedSub);
        });

        it('without pricingTier', async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                tierId: null,
            });
            payload.serviceOrder = serviceOrder;
            const patchedSettings = await StoreSettings.query()
                .patch({ recurringDiscountInPercent })
                .where({ storeId: store.id })
                .first()
                .returning('*');

            // call UoW
            const newPayload = await createServiceOrderRecurringSubscription({
                ...payload,
                settings: patchedSettings,
            });

            // assert
            const expectedSub = {
                serviceOrderId: serviceOrder.id,
                recurringSubscriptionId: payload.recurringSubscription.id,
                servicePriceId: payload.recurringSubscription.servicePriceId,
                modifierIds: payload.recurringSubscription.modifierIds,
                pickupWindow: payload.recurringSubscription.pickupWindow,
                recurringDiscountInPercent: patchedSettings.recurringDiscountInPercent,
            };
            expect(newPayload).have.property('serviceOrderRecurringSubscription');
            assert.deepOwnInclude(newPayload.serviceOrderRecurringSubscription, expectedSub);
        });
    });
});

require('../../../../testHelper');
const { cloneDeep } = require('lodash');
const { expect, assert } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const createRecurringSubscription = require('../../../../../uow/delivery/onlineOrder/createRecurringSubscription');
const StoreSettings = require('../../../../../models/storeSettings');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test createRecurringSubscription UoW', () => {
    const initialProperty = 'initialProperty';
    const paymentToken = 'paymentToken';
    let payload;

    beforeEach(async () => {
        const store = await factory.create(FN.store);
        const settings = await StoreSettings.query().where({ storeId: store.id });
        const centsCustomer = await factory.create(FN.centsCustomerWithAddress);
        const { createdAt, ...subscription } = await factory.build(FN.recurringSubscription, {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
            centsCustomerAddressId: centsCustomer.addresses[0],
            modifierIds: null,
            cancelledPickupWindows: null,
            recurringRule: null,
        });

        payload = {
            storeId: store.id,
            paymentToken,
            centsCustomer,
            centsCustomerAddressId: centsCustomer.addresses[0],
            settings,
            subscription: {
                ...subscription,
                deliveryTimingsId: subscription.returnTimingsId,
                interval: 1,
            },
        };
    });

    it('should return initial payload when subscription is not exist', async () => {
        payload = { initialProperty, subscription: {}, settings: {} };
        const initialPayload = cloneDeep(payload);

        // call UoW
        const newPayload = await createRecurringSubscription(payload);

        // assert
        expect(newPayload).not.have.property('recurringSubscription');
        assert.deepEqual(newPayload, initialPayload);
    });

    it('should throw Error with invalid interval', async () => {
        payload.subscription.interval = 0;

        // assert
        await expect(createRecurringSubscription(payload)).to.be.rejectedWith(
            'Either interval or weekday is invalid',
        );
    });

    describe('should add new properties if subscription exist', () => {
        it('without modifiers and weekday = 0', async () => {
            const timing = await factory.create(FN.timing, { day: 0 });
            payload.subscription.pickupTimingsId = timing.id;

            // call UoW
            const newPayload = await createRecurringSubscription(payload);

            // assert
            const expectedSub = {
                ...payload.subscription,
                paymentToken,
                modifierIds: [],
                recurringRule: 'DTSTART:20210907T193000Z\nRRULE:FREQ=WEEKLY;BYDAY=SU;INTERVAL=1',
            };
            delete expectedSub.deliveryTimingsId;
            delete expectedSub.interval;
            expect(newPayload).have.property('recurringSubscription');
            assert.deepOwnInclude(newPayload.recurringSubscription, expectedSub);
        });

        it('with modifiers and weekday = 1', async () => {
            const timing = await factory.create(FN.timing, { day: 1 });
            const modifier = await factory.create(FN.modifier);
            payload.subscription.pickupTimingsId = timing.id;
            payload.subscription.modifierIds = [modifier.id];

            // call UoW
            const newPayload = await createRecurringSubscription(payload);

            // assert
            const expectedSub = {
                ...payload.subscription,
                modifierIds: [modifier.id],
                paymentToken,
                recurringRule: 'DTSTART:20210907T193000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO;INTERVAL=1',
            };
            delete expectedSub.deliveryTimingsId;
            delete expectedSub.interval;
            expect(newPayload).have.property('recurringSubscription');
            assert.deepOwnInclude(newPayload.recurringSubscription, expectedSub);
        });
    });
});

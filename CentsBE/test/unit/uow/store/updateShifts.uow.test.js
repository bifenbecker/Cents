require('../../../testHelper');
const { expect, assert } = require('../../../support/chaiHelper');
const initShiftUpsert = require('../../../../uow/store/initShiftUpsert');
const updateShifts = require('../../../../uow/store/updateShifts');
const factory = require('../../../factories');
const ShiftTimeZone = require('../../../../models/shiftTimingZone');
const DeliveryTimingSettings = require('../../../../models/deliveryTimingSettings');

describe("test business-owner's updateShifts uow", () => {
    let store,
        shift,
        timing,
        ownDeliverySetting,
        zoneIds,
        testZoneIds = [10, 9];
    let shiftResponse;
    describe('updating shifts with no extra attributes', () => {
        beforeEach(async () => {
            //create a store.
            store = await factory.create('store');

            //create own delivery settings for the latter store
            ownDeliverySetting = await factory.create('ownDeliverySetting', { storeId: store.id });

            //create shifts for the above store
            shift = await factory.create('shift', {
                name: 'Day Shift',
                storeId: store.id,
                type: 'OWN_DELIVERY',
            });

            //create timings for shift created.
            timing = await factory.create('timing', { shiftId: shift.id });

            shift = {
                ...shift,
                timings: [timing],
            };
        });

        it('should update shifts successfully', async () => {
            shift.timings[0] = {
                ...shift.timings[0],
                isActive: false,
                startTime: '1970-01-01T00:01:00.000Z',
                endTime: '1970-01-01T00:20:00.000Z',
            };
            // update shift payload
            const reqPayload = {
                storeId: store.id,
                shifts: [shift],
            };

            const updateShiftPayload = await initShiftUpsert(reqPayload);
            const result = await updateShifts(updateShiftPayload);
            shiftResponse = result.shifts[0];
            //test shift
            expect(shiftResponse).to.have.a.property('name').to.equal('Day Shift');
            expect(shiftResponse).to.have.a.property('type').to.equal('OWN_DELIVERY');
            expect(shiftResponse).to.have.a.property('timings').to.be.an('array');
            //test timing
            expect(shiftResponse.timings[0]).to.have.a.property('isActive').to.equal(false);
            assert.deepEqual(
                new Date(shiftResponse.timings[0].startTime),
                new Date('1970-01-01T00:01:00.000Z'),
            );
            assert.deepEqual(
                new Date(shiftResponse.timings[0].endTime),
                new Date('1970-01-01T00:20:00.000Z'),
            );
        });

        it('should fail to update the shifts with invalid payload', async () => {
            expect(updateShifts({ userId: '123a' })).rejectedWith(Error);
        });
    });

    describe('updating shifts with zones', () => {
        beforeEach(async () => {
            //create a store.
            store = await factory.create('store');

            //create own delivery settings for the latter store
            ownDeliverySetting = await factory.create('ownDeliverySetting', {
                hasZones: true,
                storeId: store.id,
            });

            //create shifts for the above store
            shift = await factory.create('shift', {
                name: 'Day Shift',
                storeId: store.id,
                type: 'OWN_DELIVERY',
            });

            //create zones
            zones = await factory.createMany('zone', 2, {
                ownDeliverySettingsId: ownDeliverySetting.id,
            });

            //store the zone ids for the payload
            zoneIds = zones.map((zone) => zone.id);

            //create timings for shift created.
            timing = await factory.create('timing', { shiftId: shift.id });

            //create shiftTimingZone record
            shiftTimingZone = await factory.create('shiftTimingZone', {
                timingId: timing.id,
                zoneIds: [...testZoneIds],
            });

            //add zoneIds to timing objects
            shift = {
                ...shift,
                timings: [{ ...timing, zoneIds }],
            };
        });

        it('should update shifts successfully', async () => {
            shift.timings[0] = {
                ...shift.timings[0],
                isActive: false,
                startTime: '1970-01-01T00:02:00.000Z',
                endTime: '1970-01-01T00:21:00.000Z',
            };
            // update shift payload
            const reqPayload = {
                storeId: store.id,
                shifts: [shift],
            };

            const updateShiftPayload = await initShiftUpsert(reqPayload);
            const result = await updateShifts(updateShiftPayload);
            const shiftTimingZone = await ShiftTimeZone.query().findOne({
                timingId: result.shifts[0].timings[0].id,
            });
            expect(shiftTimingZone.zoneIds).to.include.members([...zoneIds]);
            //test shift
            shiftResponse = result.shifts[0];
            expect(shiftResponse).to.have.a.property('name').to.equal('Day Shift');
            expect(shiftResponse).to.have.a.property('type').to.equal('OWN_DELIVERY');
            expect(shiftResponse).to.have.a.property('timings').to.be.an('array');
            //test timing
            expect(shiftResponse.timings[0]).to.have.a.property('isActive').to.equal(false);
            assert.deepEqual(
                new Date(shiftResponse.timings[0].startTime),
                new Date('1970-01-01T00:02:00.000Z'),
            );
            assert.deepEqual(
                new Date(shiftResponse.timings[0].endTime),
                new Date('1970-01-01T00:21:00.000Z'),
            );
        });

        it('should update shifts and assign no zones successfully', async () => {
            shift.timings[0] = {
                ...shift.timings[0],
                isActive: false,
                startTime: '1970-01-01T00:02:00.000Z',
                endTime: '1970-01-01T00:21:00.000Z',
                zoneIds: [],
            };
            // update shift payload
            const reqPayload = {
                storeId: store.id,
                shifts: [shift],
            };

            const updateShiftPayload = await initShiftUpsert(reqPayload);
            const result = await updateShifts(updateShiftPayload);
            const shiftTimingZone = await ShiftTimeZone.query().findOne({
                timingId: result.shifts[0].timings[0].id,
            });
            expect(shiftTimingZone.zoneIds).to.include.members([]);
        });

        it('should fail to update the shifts with invalid payload', async () => {
            expect(updateShifts({ userId: '123a' })).rejectedWith(Error);
        });
    });

    describe('updating shifts with deliveryTimingSettings', () => {
        beforeEach(async () => {
            //create a store.
            store = await factory.create('store');

            //create own delivery settings for the latter store
            ownDeliverySetting = await factory.create('ownDeliverySetting', { hasZones: true, storeId: store.id });

            //create shifts for the above store
            shift = await factory.create('shift', { name: 'Day Shift', storeId: store.id, type: 'OWN_DELIVERY' });

            //create timings for shift created.
            timing = await factory.create('timing', { shiftId: shift.id });

            deliveryTimingSettings = await factory.create('deliveryTimingSettings', { timingsId: timing.id });

            //add deliveryTimingSettings to timing objects
            shift = {
                ...shift,
                timings: [{ ...timing, deliveryTimingSettings }],
            };
        });

        it('should update shifts successfully', async () => {

            shift.timings[0] = {
                ...shift.timings[0],
                isActive: false,
                startTime: '1970-01-01T00:02:00.000Z',
                endTime: '1970-01-01T00:21:00.000Z',
            };
            // update shift payload
            const reqPayload = {
                storeId: store.id,
                shifts: [shift],
            };

            const updateShiftPayload = await initShiftUpsert(reqPayload);
            const result = await updateShifts(updateShiftPayload);

            const timingsDeliveryTimingSettings = await DeliveryTimingSettings.query().findOne({
                timingsId: result.shifts[0].timings[0].id
            });
            expect(timingsDeliveryTimingSettings.id).to.equal(deliveryTimingSettings.id);

            //test shift
            shiftResponse = result.shifts[0];
            expect(shiftResponse).to.have.a.property('name').to.equal('Day Shift');
            expect(shiftResponse).to.have.a.property('type').to.equal('OWN_DELIVERY');
            expect(shiftResponse).to.have.a.property('timings').to.be.an('array');
            //test timing
            expect(shiftResponse.timings[0]).to.have.a.property('isActive').to.equal(false);
            assert.deepEqual(new Date(shiftResponse.timings[0].startTime), new Date('1970-01-01T00:02:00.000Z'));
            assert.deepEqual(new Date(shiftResponse.timings[0].endTime), new Date('1970-01-01T00:21:00.000Z'));
        });

        it('should update shifts and assign no deliveryTimingSettings successfully', async () => {

            shift.timings[0] = {
                ...shift.timings[0],
                isActive: false,
                startTime: '1970-01-01T00:02:00.000Z',
                endTime: '1970-01-01T00:21:00.000Z',
                deliveryTimingSettings: null
            };
            // update shift payload
            const reqPayload = {
                storeId: store.id,
                shifts: [shift],
            };

            const updateShiftPayload = await initShiftUpsert(reqPayload);
            const result = await updateShifts(updateShiftPayload);

            const timingsDeliveryTimingSettings = await DeliveryTimingSettings.query().findOne({
                timingsId: result.shifts[0].timings[0].id
            });
            expect(timingsDeliveryTimingSettings.id).to.equal(deliveryTimingSettings.id);
        });

        it('should fail to update the shifts with invalid payload', async () => {
            expect(updateShifts({ userId: '123a' })).rejectedWith(Error);
        });
    });
});

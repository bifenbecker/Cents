require('../../../testHelper');
const { expect, assert } = require('../../../support/chaiHelper');
const initShiftUpsert = require('../../../../uow/store/initShiftUpsert');
const factory = require('../../../factories');
const ShiftTimeZone = require('../../../../models/shiftTimingZone');

describe('test business-owner\'s initShiftUpsert uow', () => {
    let store, shift, timing, ownDeliverySetting, zoneIds, testZoneIds = [10, 9];
    let shiftResponse;
    describe('only creates', () => {
        beforeEach(async () => {
            //create a store.
            store = await factory.create('store');
        });

        it('should create a new shift successfully', async () => {
            // new shift payload
            const
                shiftPayload = {
                    name: 'Window 123124',
                    type: 'OWN_DELIVERY',
                    timings: [
                        {
                            day: '1',
                            startTime: '1970-01-01T00:02:00.000Z',
                            endTime: '1970-01-01T00:13:00.000Z',
                            isActive: true,
                        },
                    ],
                },
                reqPayload = {
                    storeId: store.id,
                    shifts: [shiftPayload],
                };

            const result = await initShiftUpsert(reqPayload);

            expect(result).to.be.an('object');

            expect(result).to.have.property('shifts').to.be.an('array');
            expect(result.shifts.length).to.equal(0);

            expect(result).to.have.property('shiftsToUpdate').to.be.an('array');
            expect(result.shiftsToUpdate.length).to.equal(0);

            expect(result).to.have.property('shiftsToCreate').to.be.an('array');
            expect(result.shiftsToCreate.length).to.equal(1);
            assert.deepEqual(result.shiftsToCreate[0], shiftPayload);
        });

        it('should fail to initShiftUpsert the shifts with invalid payload', async () => {
            expect(initShiftUpsert({ userId: '123a' })).rejectedWith(Error);
        });
    });

    describe('only updates', () => {
        beforeEach(async () => {
            //create a store.
            store = await factory.create('store');

            //create own delivery settings for the latter store
            ownDeliverySetting = await factory.create('ownDeliverySetting', { storeId: store.id });

            //create shifts for the above store
            shift = await factory.create('shift', { name: 'Day Shift', storeId: store.id, type: 'OWN_DELIVERY' });

            //create timings for shift created.
            timing = await factory.create('timing', { shiftId: shift.id });

            shift = {
                ...shift,
                timings: [timing],
            };
        });

        it('should update shifts successfully', async () => {
            // update shift payload
            const updateShiftPayload = {
                storeId: store.id,
                shifts: [shift]
            };

            const result = await initShiftUpsert(updateShiftPayload);

            expect(result).to.be.an('object');

            expect(result).to.have.property('shifts').to.be.an('array');
            expect(result.shifts.length).to.equal(0);

            expect(result).to.have.property('shiftsToUpdate').to.be.an('array');
            expect(result.shiftsToUpdate.length).to.equal(1);
            assert.deepEqual(result.shiftsToUpdate[0], shift);

            expect(result).to.have.property('shiftsToCreate').to.be.an('array');
            expect(result.shiftsToCreate.length).to.equal(0);
        });

        it('should fail to initShiftUpsert the shifts with invalid payload', async () => {
            expect(initShiftUpsert({ userId: '123a' })).rejectedWith(Error);
        });
    });

    describe('both creates and updates', () => {
        beforeEach(async () => {
            //create a store.
            store = await factory.create('store');

            //create own delivery settings for the latter store
            ownDeliverySetting = await factory.create('ownDeliverySetting', { storeId: store.id });

            //create shifts for the above store
            shift = await factory.create('shift', { name: 'Day Shift', storeId: store.id, type: 'OWN_DELIVERY' });

            //create timings for shift created.
            timing = await factory.create('timing', { shiftId: shift.id });

            shift = {
                ...shift,
                timings: [timing],
            };
        });

        it('should update and add new shift successfully', async () => {
            // update and creating new shift payoad
            const
                newShiftPayload = {
                    name: 'Window 123124',
                    type: 'OWN_DELIVERY',
                    timings: [
                        {
                            day: '1',
                            startTime: '1970-01-01T00:02:00.000Z',
                            endTime: '1970-01-01T00:13:00.000Z',
                            isActive: true,
                        },
                    ],
                },
                reqPayload = {
                    storeId: store.id,
                    shifts: [shift, newShiftPayload],
                };

            const result = await initShiftUpsert(reqPayload);

            expect(result).to.be.an('object');

            expect(result).to.have.property('shifts').to.be.an('array');
            expect(result.shifts.length).to.equal(0);

            expect(result).to.have.property('shiftsToUpdate').to.be.an('array');
            expect(result.shiftsToUpdate.length).to.equal(1);
            assert.deepEqual(result.shiftsToUpdate[0], shift);

            expect(result).to.have.property('shiftsToCreate').to.be.an('array');
            expect(result.shiftsToCreate.length).to.equal(1);
            assert.deepEqual(result.shiftsToCreate[0], newShiftPayload);

        });
    })
});

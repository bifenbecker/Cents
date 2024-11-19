const mockDate = require('mockdate');
const moment = require('moment-timezone');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const StoreSettings = require('../../../../models/storeSettings');
const getShiftsForStoreUOW = require('../../../../uow/driverApp/getShiftsForStoreUOW');

const createTimingrecord = (shiftId, day, startTime, endTime) => {
    return factory.create(FN.timing, {
        shiftId,
        day,
        startTime,
        endTime,
    })
}

const now =  moment.tz('9-7-2022', 'America/Los_Angeles');

describe('test getShiftsForStoreUOW', () => {
    let teamMemberId, storeId
    const timeZone = 'America/New_York';
    beforeEach(async () => {
        const store = await factory.create(FN.store)
        storeId = store.id
        await StoreSettings.query().patch({
            timeZone
        }).where('storeId', storeId)
        const teamMember = await factory.create(FN.teamMember, {
            businessId: store.businessId
        })
        teamMemberId = teamMember.id
        teamMemberStore = await factory.create(FN.teamMemberStore, {
            teamMemberId,
            storeId
        })
    })

    it('should throw error saying store not found', async () => {
        await expect(getShiftsForStoreUOW({storeId: 10987, teamMemberId})).to.be.rejectedWith(
            'Store Not Found'
        )
    })

    describe('without any shifts for the store', () => {
        it('should return empty array for todaysShiftsTimings', async () => {
            const result = await getShiftsForStoreUOW({storeId, teamMemberId})
            expect(result.todaysShiftsTimings).to.be.an('array').of.length(0)
        })

        it('should return empty object for tomorrowsShiftTiming', async () => {
            const result = await getShiftsForStoreUOW({storeId, teamMemberId})
            expect(result.tomorrowsShiftTiming).to.be.empty
        })

        it('should have store property', async () => {
            const result = await getShiftsForStoreUOW({storeId, teamMemberId})
            expect(result).to.have.property('store')
        })

        it('should have storeTimezone property', async () => {
            const result = await getShiftsForStoreUOW({storeId, teamMemberId})
            expect(result).to.have.property('storeTimezone').to.eq(timeZone)
        })

        it('should have today property', async () => {
            const result = await getShiftsForStoreUOW({storeId, teamMemberId})
            expect(result).to.have.property('today')
        })
    })

    describe('with shifts for the store', () => {
        let shift1;
        beforeEach(async () => {
            mockDate.set(now);
            shift1 = await factory.create(FN.ownDeliveryShift, {
                name: 'shift1',
                storeId
            })
            const timing1 = await createTimingrecord(shift1.id, 2, '1970-01-01T11:00:00.000Z', '1970-01-01T12:00:00.000Z')
        })

        afterEach(() => {
            mockDate.reset();
        });
        it('should show tomorrowsShiftTiming same as todaysShiftsTimings since there is only one day enabled for delivery', async () => {
            const result = await getShiftsForStoreUOW({
                teamMemberId,
                storeId
            })
            expect(result).to.have.property('tomorrowsShiftTiming')
            expect(result).to.have.property('todaysShiftsTimings')
            expect(result.tomorrowsShiftTiming).to.have.property('day').to.equal('2')
            expect(result.tomorrowsShiftTiming).to.have.property('shift').to.deep.eq({
                name: "shift1"
            })
            expect(result.tomorrowsShiftTiming).to.have.property('shiftId').to.equal(shift1.id)
            expect(result.todaysShiftsTimings[0]).to.have.property('day').to.equal('2')
            expect(result.todaysShiftsTimings[0]).to.have.property('shiftId').to.equal(shift1.id)
            expect(new Date(result.tomorrowsShiftTiming.startTime)).to.deep.eq(
                new Date('1970-01-01T11:00:00.000Z')
            )
        })
        
        it('should return two elements in todaysShiftsTimings since there are two shifts in one day', async () => {
            const timing2 = await createTimingrecord(shift1.id, 2, '1970-01-01T09:00:00.000Z', '1970-01-01T10:00:00.000Z')
            const result = await getShiftsForStoreUOW({
                teamMemberId,
                storeId
            })
            expect(result).to.have.property('todaysShiftsTimings')
            expect(result).to.have.property('todaysShiftsTimings').to.be.an('array').of.length(2)
            expect(new Date(result.todaysShiftsTimings[0].startTime)).to.deep.eq(
                new Date('1970-01-01T09:00:00.000Z')
            )
            expect(new Date(result.todaysShiftsTimings[1].startTime)).to.deep.eq(
                new Date('1970-01-01T11:00:00.000Z')
            )           
            expect(result).to.have.property('tomorrowsShiftTiming')
        })

        it('should sort the shifts in asc order if there are two shifts for tomorrow', async () => {
            const timing2 = await createTimingrecord(shift1.id, 2, '1970-01-01T09:00:00.000Z', '1970-01-01T10:00:00.000Z')
            const result = await getShiftsForStoreUOW({
                teamMemberId,
                storeId
            })
            expect(result).to.have.property('todaysShiftsTimings')
            expect(result).to.have.property('todaysShiftsTimings').to.be.an('array').of.length(2)
            expect(result).to.have.property('tomorrowsShiftTiming')
            expect(new Date(result.tomorrowsShiftTiming.startTime)).to.deep.eq(
                new Date('1970-01-01T09:00:00.000Z')
            )
        })

        it('should return tomorrowsShiftTiming as day 5', async () => {
            const timing2 = await createTimingrecord(shift1.id, 5, '1970-01-01T08:00:00.000Z', '1970-01-01T09:00:00.000Z')
            const result = await getShiftsForStoreUOW({
                teamMemberId,
                storeId
            })
            expect(result).to.have.property('todaysShiftsTimings')
            expect(result).to.have.property('todaysShiftsTimings').to.be.an('array').of.length(1)
            expect(new Date(result.todaysShiftsTimings[0].startTime)).to.deep.eq(
                new Date('1970-01-01T11:00:00.000Z')
            )
            expect(result).to.have.property('tomorrowsShiftTiming')
            expect(result.tomorrowsShiftTiming).to.have.property('day').to.equal('5')
            expect(result.tomorrowsShiftTiming).to.have.property('shift').to.deep.eq({
                name: "shift1"
            })
        })

        it('should return tomorrowsShiftTiming as day 1 since next avilable shift is day 1', async () => {
            const timing2 = await createTimingrecord(shift1.id, 1, '1970-01-01T08:00:00.000Z', '1970-01-01T09:00:00.000Z')
            const result = await getShiftsForStoreUOW({
                teamMemberId,
                storeId
            })
            expect(result).to.have.property('tomorrowsShiftTiming')
            expect(result.tomorrowsShiftTiming).to.have.property('day').to.equal('1')
            expect(result.tomorrowsShiftTiming).to.have.property('shift').to.deep.eq({
                name: "shift1"
            })
        })

        describe('with multiple windows', () => {
            let shift2
            beforeEach(async () => {
                const timing2 = await createTimingrecord(shift1.id, 5, '1970-01-01T08:00:00.000Z', '1970-01-01T09:00:00.000Z')

                shift2 = await factory.create(FN.ownDeliveryShift, {
                    name: 'shift2',
                    storeId
                })
            })


            it('should return day 3 from second window as tomorrowsShiftTiming', async () => {
                const timing1 = await createTimingrecord(shift2.id, 3, '1970-01-01T08:00:00.000Z', '1970-01-01T09:00:00.000Z')
                const result = await getShiftsForStoreUOW({
                    teamMemberId,
                    storeId
                })
                expect(result).to.have.property('tomorrowsShiftTiming')
                expect(result.tomorrowsShiftTiming).to.have.property('day').to.equal('3')
                expect(result.tomorrowsShiftTiming).to.have.property('shift').to.deep.eq({
                    name: "shift2"
                })
            })

            it('should return day 5 of first window as tomorrowsShiftTiming', async () => {
                const timing1 = await createTimingrecord(shift2.id, 1, '1970-01-01T08:00:00.000Z', '1970-01-01T09:00:00.000Z')
                const result = await getShiftsForStoreUOW({
                    teamMemberId,
                    storeId
                })
                expect(result).to.have.property('tomorrowsShiftTiming')
                expect(result.tomorrowsShiftTiming).to.have.property('day').to.equal('5')
                expect(result.tomorrowsShiftTiming).to.have.property('shift').to.deep.eq({
                    name: "shift1"
                })
            })
        })
    })
    describe('when today is sunday', () => {
      describe('when shifts are available', () => {
        let shift1;
        const sundayDate = moment.tz('9-18-2022', 'America/Los_Angeles');
        beforeEach(async () => {
          mockDate.set(sundayDate);
          shift1 = await factory.create(FN.ownDeliveryShift, {
            name: 'Sunday Shift',
            storeId
          })
          await createTimingrecord(shift1.id, 0, '1970-01-01T11:00:00.000Z', '1970-01-01T12:00:00.000Z')
        })
  
        afterEach(() => {
          mockDate.reset();
        });
        it('should return only one shift', async () => {
          const result = await getShiftsForStoreUOW({ storeId, teamMemberId })
          expect(result).to.have.property('tomorrowsShiftTiming')
          expect(result.tomorrowsShiftTiming).to.have.property('day').to.equal('0')
          expect(result.tomorrowsShiftTiming).to.have.property('shift').to.deep.eq({
            name: 'Sunday Shift'
          })
        })
      })
      describe('when shifts are not available', () => {
        let shift1;
        const sundayDate = moment.tz('9-18-2022', 'America/Los_Angeles');
        beforeEach(async () => {
          mockDate.set(sundayDate);
        })
        afterEach(() => {
          mockDate.reset();
        });
  
        it('should return empty array for todaysShiftsTimings', async () => {
          const result = await getShiftsForStoreUOW({ storeId, teamMemberId })
          expect(result.todaysShiftsTimings).to.be.an('array').of.length(0)
        })
  
        it('should return empty object for tomorrowsShiftTiming', async () => {
          const result = await getShiftsForStoreUOW({ storeId, teamMemberId })
          expect(result.tomorrowsShiftTiming).to.be.empty
        })
  
        it('should have store property', async () => {
          const result = await getShiftsForStoreUOW({ storeId, teamMemberId })
          expect(result).to.have.property('store')
        })
  
        it('should have storeTimezone property', async () => {
          const result = await getShiftsForStoreUOW({ storeId, teamMemberId })
          expect(result).to.have.property('storeTimezone').to.eq(timeZone)
        })
  
        it('should have today property', async () => {
          const result = await getShiftsForStoreUOW({ storeId, teamMemberId })
          expect(result).to.have.property('today')
        })
      })
    })
})
require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const RecurringOnlineOrderClone = require('../../../../builders/cloning/recurringOnlineOrderClone.js')
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const sinon = require('sinon');
const moment = require('moment-timezone');

const businessCustomerData = {
    id: 1,
    businessId: 1,
    centsCustomerId: 1,
    isCommercial: false
}

describe('test recurringOnlineOrderClone', () => {
    let recurringOnlineOrderClone
    beforeEach(async () => {
        const serviceOrder = await factory.create(FN.serviceOrder)
        recurringOnlineOrderClone = new RecurringOnlineOrderClone(serviceOrder.id)
    })

    it('addBusinessCustomer method should be called ', async () => {
        const recurringOrderClone = RecurringOnlineOrderClone.prototype
        const buildMethodStub = sinon.stub(recurringOrderClone, 'build')
        const setCentsCustomerStub = sinon.stub(recurringOrderClone, 'setCentsCustomer')
        const addCentsCustomerStub = sinon.stub(recurringOrderClone, 'addCentsCustomer')
        const addBusinessCustomerStub = sinon.stub(recurringOrderClone, 'addBusinessCustomer')
        const addCustomerAddressStub = sinon.stub(recurringOrderClone, 'addCustomerAddress')
        const addOrderItemsStub = sinon.stub(recurringOrderClone, 'addOrderItems')
        const addESStoreStub = sinon.stub(recurringOrderClone, 'addESStore')
        const addSettingsStub = sinon.stub(recurringOrderClone, 'addSettings')
        const addOrderTypeStub = sinon.stub(recurringOrderClone, 'addOrderType')
        const addStatusStub = sinon.stub(recurringOrderClone, 'addStatus')
        const addBusinessIdStub = sinon.stub(recurringOrderClone, 'addBusinessId')
        const addPaymentTimingStub = sinon.stub(recurringOrderClone, 'addPaymentTiming')
        const addOriginStub = sinon.stub(recurringOrderClone, 'addOrigin')
        const addHubInfoStub = sinon.stub(recurringOrderClone, 'addHubInfo')
        const addRecurringSubscriptionStub = sinon.stub(recurringOrderClone, 'addRecurringSubscription')
        const addZipCodeStub = sinon.stub(recurringOrderClone, 'addZipCode')

        await recurringOnlineOrderClone.buildForPipeline()
        sinon.assert.calledOnce(buildMethodStub)
        sinon.assert.calledOnce(setCentsCustomerStub)
        sinon.assert.calledOnce(addCentsCustomerStub)
        sinon.assert.calledOnce(addBusinessCustomerStub)
        sinon.assert.calledOnce(addCustomerAddressStub)
        sinon.assert.calledOnce(addOrderItemsStub)
        sinon.assert.calledOnce(addESStoreStub)
        sinon.assert.calledOnce(addSettingsStub)
        sinon.assert.calledOnce(addOrderTypeStub)
        sinon.assert.calledOnce(addStatusStub)
        sinon.assert.calledOnce(addBusinessIdStub)
        sinon.assert.calledOnce(addPaymentTimingStub)
        sinon.assert.calledOnce(addOriginStub)
        sinon.assert.calledOnce(addHubInfoStub)
        sinon.assert.calledOnce(addRecurringSubscriptionStub)
        sinon.assert.calledOnce(addZipCodeStub)

    })

    it('should set businessCustomer in the payload', async () => {
        recurringOnlineOrderClone.serviceOrder = {
            storeCustomer: {
                businessCustomer: businessCustomerData
            }
        }
        await recurringOnlineOrderClone.addBusinessCustomer()
        const payload = recurringOnlineOrderClone.payload
        expect(payload).to.have.property('businessCustomer')
        expect(payload.businessCustomer).to.deep.eq(businessCustomerData)
    })

    it('should set zipCode in the payload', async () => {
        recurringOnlineOrderClone.payload = {
            address: {
                postalCode: '10010'
            }
        }
        await recurringOnlineOrderClone.addZipCode()
        const payload = recurringOnlineOrderClone.payload
        expect(payload).to.have.property('zipCode')
        expect(payload.zipCode).to.equal('10010')
    })

    describe('test generateStartAndEndTimeWindow method', () => {
        const timeZone = 'America/Los_Angeles'
        beforeEach(async () => {
            recurringOnlineOrderClone.serviceOrder = {
                store: {
                    settings: {
                        timeZone,
                    }
                }
            }
        })
        it('if the time difference between pickup and delivery is less than 24 hours', async () => {
            const pickupWindow = [
                moment.tz(timeZone).subtract(7, 'days').startOf('day').set({
                    'hours': 10,
                }),
                moment.tz(timeZone).startOf('day').subtract(7, 'days').set({
                    'hours': 14,
                }),
            ]
            const deliveryWindow = [
                moment.tz(timeZone).subtract(6, 'days').startOf('day').set({
                    'hours': 9,
                }),
                moment.tz(timeZone).subtract(6, 'days').startOf('day').set({
                    'hours': 13,
                }),
            ]
            const [pickupStartTime, pickupEndTime] = recurringOnlineOrderClone.generateStartAndEndTimeWindow(pickupWindow)
            const [deliveryStartTime, deliveryEndTime] = recurringOnlineOrderClone.generateStartAndEndTimeWindow(deliveryWindow, pickupWindow[0])
            expect(pickupStartTime).to.equal(moment.tz(timeZone).add(1, 'day').startOf('day').set({
                'hours': 10,
            }).valueOf())
            expect(pickupEndTime).to.equal(moment.tz(timeZone).add(1, 'day').startOf('day').set({
                'hours': 14,
            }).valueOf())
            expect(deliveryStartTime).to.equal(moment.tz(timeZone).add(2, 'day').startOf('day').set({
                'hours': 9,
            }).valueOf())
            expect(deliveryEndTime).to.equal(moment.tz(timeZone).add(2, 'day').startOf('day').set({
                'hours': 13,
            }).valueOf())
        })
        it('if the time difference between pickup and delivery is greater than 24 hours but in the same slots', async () => {
            const pickupWindow = [
                moment.tz(timeZone).subtract(7, 'days').startOf('day').set({
                    'hours': 10,
                }),
                moment.tz(timeZone).startOf('day').subtract(7, 'days').set({
                    'hours': 14,
                }),
            ]
            const deliveryWindow = [
                moment.tz(timeZone).subtract(5, 'days').startOf('day').set({
                    'hours': 10,
                }),
                moment.tz(timeZone).subtract(5, 'days').startOf('day').set({
                    'hours': 14,
                }),
            ]
            const [pickupStartTime, pickupEndTime] = recurringOnlineOrderClone.generateStartAndEndTimeWindow(pickupWindow)
            const [deliveryStartTime, deliveryEndTime] = recurringOnlineOrderClone.generateStartAndEndTimeWindow(deliveryWindow, pickupWindow[0])
            expect(pickupStartTime).to.equal(moment.tz(timeZone).add(1, 'day').startOf('day').set({
                'hours': 10,
            }).valueOf())
            expect(pickupEndTime).to.equal(moment.tz(timeZone).add(1, 'day').startOf('day').set({
                'hours': 14,
            }).valueOf())
            expect(deliveryStartTime).to.equal(moment.tz(timeZone).add(3, 'day').startOf('day').set({
                'hours': 10,
            }).valueOf())
            expect(deliveryEndTime).to.equal(moment.tz(timeZone).add(3, 'day').startOf('day').set({
                'hours': 14,
            }).valueOf())
        })
    })
})
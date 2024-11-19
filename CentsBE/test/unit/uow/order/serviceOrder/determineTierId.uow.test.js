require('../../../../testHelper');
const { determineTierId } = require('../../../../../uow/order/serviceOrder/determineTierId');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const onlineOrderServicesQueryHelper = require('../../../../../helpers/onlineOrderServicesQueryHelper')
const sinon = require('sinon')


describe('test determineTierId Uow', () => {
    let businessCustomer, storeCustomer, payload
    beforeEach(async () => {
        businessCustomer = await factory.create(FN.businessCustomer)
        storeCustomer = await factory.create(FN.storeCustomer, {
            businessId: businessCustomer.businessId,
        })
        payload = {
            businessCustomer,
            storeId: storeCustomer.storeId,
            zipCode: '10010'
        }

    })

    describe('with pricingTier', () => {
        let getQueryParamsforServicesStub
        beforeEach(async () => {
            getQueryParamsforServicesStub = sinon.stub(onlineOrderServicesQueryHelper, "getQueryParamsforServices").returns({
                queryColumn: 'pricingTierId',
                queryColumnValue: businessCustomer.commercialTierId
            });
        })
        it('should include tierId in the payload', async () => {
            const res = await determineTierId(payload)
            expect(res).to.have.property('tierId').to.equal(businessCustomer.commercialTierId)
            sinon.assert.calledOnce(getQueryParamsforServicesStub)
        })
    })

    describe('with out pricingTier', () => {
        let getQueryParamsforServicesStub
        beforeEach(async () => {
            getQueryParamsforServicesStub = sinon.stub(onlineOrderServicesQueryHelper, "getQueryParamsforServices").returns(payload);
        })
        it('should not include tierId in the payload', async () => {
            const res = await determineTierId(payload)
            expect(res).to.have.property('tierId').to.be.null
            sinon.assert.calledOnce(getQueryParamsforServicesStub)
        })
    })
})
require('../../../../testHelper');
const sinon = require('sinon');
const { expect } = require('../../../../support/chaiHelper');
const { STRIPE_PAYOUT_RESPONSE } = require('../../../../constants/responseMocks');
const stripe = require('../../../../../stripe/stripeWithSecret');
const generateStripePayoutListUow = require('../../../../../uow/reports/stripe/generateStripePayoutListUow')

describe('test generateStripePayoutsList uow', () => {
    let payload
    beforeEach(async () => {
        payload = {
            options: {
                formattedStartDate: '2022-06-20T00:00:00Z',
                formattedEndDate: '2022-06-30T12:59:32.582Z',
                business: {
                    merchantId: 'merchant_account'
                }
            }
        }
    })

    it('should return list of payouts of the business', async () => {
        sinon.stub(stripe.payouts, 'list')
        .callsFake(() => {
            return {
                "has_more": false,
                data: [
                    {
                        ...STRIPE_PAYOUT_RESPONSE
                    }
                ]
            }
        });
        const res = await generateStripePayoutListUow(payload)
        expect(res).to.have.property('stripePayouts')
        expect(res.stripePayouts).to.be.an('array')
        expect(res.stripePayouts).to.be.of.length(1)
    })

    it('should return list of 2 payouts since has_more is true', async () => {
        const stubedStripeCall = sinon.stub(stripe.payouts, 'list')
        stubedStripeCall.onFirstCall().returns(
            {
                "has_more": true,
                data: [
                    {
                        ...STRIPE_PAYOUT_RESPONSE
                    }
                ]
            }
        )
        stubedStripeCall
        .onSecondCall().returns(
            {
                "has_more": false,
                data: [
                    {
                        ...STRIPE_PAYOUT_RESPONSE
                    }
                ]
            }
        )
        const res = await generateStripePayoutListUow(payload)
        expect(res).to.have.property('stripePayouts')
        expect(res.stripePayouts).to.be.an('array')
        expect(res.stripePayouts).to.be.of.length(2)
    })

    it('should not return failed payout in the res', async () => {
        const payoutsRes = STRIPE_PAYOUT_RESPONSE
        sinon.stub(stripe.payouts, 'list')
        .callsFake(() => {
            return {
                "has_more": false,
                data: [
                    {
                        ...payoutsRes
                    },
                    {
                        ...payoutsRes,
                        status: 'failed'
                    }
                ]
            }
        });
        const res = await generateStripePayoutListUow(payload)
        expect(res).to.have.property('stripePayouts')
        expect(res.stripePayouts).to.be.an('array')
        expect(res.stripePayouts).to.be.of.length(1)
    })
})
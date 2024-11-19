require('../../../../testHelper');
const sinon = require('sinon');
const { expect } = require('../../../../support/chaiHelper');
const {
    STRIPE_PAYOUT_BALANCE_TRANSACTION_RESPONSE,
    STRIPE_PAYOUT_RESPONSE,
} = require('../../../../constants/responseMocks');
const stripe = require('../../../../../stripe/stripeWithSecret');
const getBalanceTransactionsForPayoutsUow = require('../../../../../uow/reports/stripe/getBalanceTransactionsForPayoutsUow');

describe('test getBalanceTransactionsForPayouts uow', () => {
    let payload;
    beforeEach(async () => {
        payload = {
            options: {
                finalStartDate: '06-21-2022 00:00:00',
                finalEndDate: '06-30-2022 23:59:59',
                business: {
                    merchantId: 'merchant_account',
                },
                timeZone: 'America/Los_Angeles',
            },
            stripePayouts: [
                {
                    ...STRIPE_PAYOUT_RESPONSE,
                },
            ],
        };
    });

    it('should return balance transactions of the payout', async () => {
        sinon.stub(stripe.balanceTransactions, 'list').callsFake(() => {
            return {
                has_more: false,
                data: [
                    {
                        ...STRIPE_PAYOUT_BALANCE_TRANSACTION_RESPONSE,
                    },
                ],
            };
        });
        const res = await getBalanceTransactionsForPayoutsUow(payload);
        expect(res).to.have.property('balanceTransactions');
    });

    it('should return reportName in the reponse', async () => {
        sinon.stub(stripe.balanceTransactions, 'list').callsFake(() => {
            return {
                has_more: false,
                data: [
                    {
                        ...STRIPE_PAYOUT_BALANCE_TRANSACTION_RESPONSE,
                    },
                ],
            };
        });
        const res = await getBalanceTransactionsForPayoutsUow(payload);
        expect(res)
            .to.have.property('reportName')
            .to.equal(`Cents_Online_Payouts_06-20-2022-06-29-2022.csv`);
        expect(res)
            .to.have.property('reportHeaders')
            .to.deep.eq([
                { title: 'Transfer Amount', id: 'transferAmount' },
                { title: 'Transfer Initiated Date', id: 'createdAt' },
                { title: 'Transfer Expected Date *', id: 'arrivedAt' },
                { title: 'Customer PAID Amount', id: 'customerPaidAmount' },
                { title: 'To be PAID Out', id: 'toBePaidOut' },
                { title: 'Payment Date', id: 'paymentDate' },
                { title: 'Order Code', id: 'orderCode' },
                { title: 'Location Name', id: 'storeName' },
            ]);
        expect(res).to.have.property('reportObjectType').to.equal('object');
    });

    it('should return 2 balance transactions if has_more is true', async () => {
        const stubedStripeCall = sinon.stub(stripe.balanceTransactions, 'list');
        stubedStripeCall.onFirstCall().returns({
            has_more: true,
            data: [
                {
                    ...STRIPE_PAYOUT_BALANCE_TRANSACTION_RESPONSE,
                },
            ],
        });
        stubedStripeCall.onSecondCall().returns({
            has_more: false,
            data: [
                {
                    ...STRIPE_PAYOUT_BALANCE_TRANSACTION_RESPONSE,
                },
            ],
        });
        const res = await getBalanceTransactionsForPayoutsUow(payload);
        expect(res).to.have.property('balanceTransactions');
        expect(res.balanceTransactions).to.be.an('array').of.length(2);
    });
});

require('../../../../testHelper');
const { expect, chai } = require('../../../../support/chaiHelper');
chai.use(require('chai-as-promised'));
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { updateCreditHistoryUow } = require('../../../../../uow/machines/runMachine/updateCreditHistoryUow');
const CreditHistory = require('../../../../../models/creditHistory');

describe('test updateCreditHistoryUow function', () => {
    let business;
    let store;
    let centsCustomer;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
    })

    describe('when credit amount is missed in payload', () => {
        it('should not create CreditHistory entity and change payload', async () => {
            const payloadMock = {
                centsCustomerId: centsCustomer.id,
                businessId: business.id,
            };

            const result = await updateCreditHistoryUow(payloadMock);
            const creditHistory = await CreditHistory.query();

            expect(creditHistory.length).to.be.eql(0);
            expect(result).to.be.deep.equal(payloadMock);
        });
    })

    describe('when credit amount exist in payload', () => {
        it('should be rejected if credit amount is not enough', async () => {
            const payloadMock = {
                centsCustomerId: centsCustomer.id,
                businessId: business.id,
                creditAmount: 67,
            };

            await expect(updateCreditHistoryUow(payloadMock)).to.be.rejected;
        });

        it('should be created CreditHistory entity if credit amount is enough', async () => {
            const payloadMock = {
                centsCustomerId: centsCustomer.id,
                businessId: business.id,
                creditAmount: 67,
            };
            await factory.create(FACTORIES_NAMES.creditHistory, {
                amount: 90,
                customerId: centsCustomer.id,
                businessId: business.id,
            });

            const result = await updateCreditHistoryUow(payloadMock);
            const creditHistory = await CreditHistory.query().orderBy('id', 'DESC').first();

            expect(result).to.deep.equal(payloadMock);
            expect(creditHistory).to.have.property('amount').to.be.eql(-payloadMock.creditAmount);

            await CreditHistory.query().delete();
        });
    })
});

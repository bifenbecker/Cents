require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation, hasTable, belongsToOne } = require('../../support/objectionTestHelper');
const CreditHistory = require('../../../models/creditHistory');
const factory = require('../../factories');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');

describe('test creditHistory model', () => {
    it('should return true if creditHistory table exists', async () => {
        const hasTableName = await hasTable(CreditHistory.tableName);
        expect(hasTableName).to.be.true;
    });

    it('should return true if creditHistory idColumn exists', async () => {
        const idColumn = await CreditHistory.idColumn;
        expect(idColumn).not.to.be.empty;
    });

    it('creditHistory should have business association', () => {
        hasAssociation(CreditHistory, 'business');
    });

    it('creditHistory should belongs to one relation business association', async () => {
        belongsToOne(CreditHistory, 'business');
    });

    it('creditHistory should have creditReason association', async () => {
        hasAssociation(CreditHistory, 'creditReason');
    });

    it('creditHistory should belongs to one relation creditReason association', async () => {
        belongsToOne(CreditHistory, 'creditReason');
    });

    it('creditHistory should have centsCustomer association', async () => {
        hasAssociation(CreditHistory, 'centsCustomer');
    });

    it('creditHistory should belongs to one relation centsCustomer association', async () => {
        belongsToOne(CreditHistory, 'centsCustomer');
    });

    it('creditHistory model should have getCentsCustomer method when created', async () => {
        const creditHistory = await factory.create('creditHistory');
        expect(creditHistory.getCentsCustomer).to.be.a('function');
    });

    it('creditHistory model getCentsCustomer method should return centsCustomer', async () => {
        const centsCustomer = await factory.create('centsCustomer'),
            creditHistory = await factory.create('creditHistory', {
                customerId: centsCustomer.id,
            });
        expect((await creditHistory.getCentsCustomer()).id).to.be.eq(centsCustomer.id);
    });

    it('creditHistory model should have getBusiness method when created', async () => {
        const creditHistory = await factory.create('creditHistory');
        expect(creditHistory.getBusiness).to.be.a('function');
    });

    it('creditHistory model getBusiness method should return laundromatBusiness', async () => {
        const laundromatBusiness = await factory.create('laundromatBusiness'),
            creditHistory = await factory.create('creditHistory', {
                businessId: laundromatBusiness.id,
            });
        expect((await creditHistory.getBusiness()).id).to.be.eq(laundromatBusiness.id);
    });

    it('creditHistory model should have getCreditReason method when created', async () => {
        const creditHistory = await factory.create('creditHistory');
        expect(creditHistory.getCreditReason).to.be.a('function');
    });

    it('creditHistory model getCreditReason method should return creditReason', async () => {
        const creditReason = await factory.create('creditReason'),
            creditHistory = await factory.create('creditHistory', {
                reasonId: creditReason.id,
            });
        expect((await creditHistory.getCreditReason()).id).to.be.eq(creditReason.id);
    });

    it('creditHistory model should be extended with withdrawCredits method', async () => {
        expect(CreditHistory).to.have.property('withdrawCredits');
    });

    it('creditHistory model withdrawCredits static method should not create an entity if credits not enough', async () => {
        const centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        const business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        const store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        await factory.create(FACTORIES_NAMES.storeCustomer, {
            centsCustomerId: centsCustomer.id,
            businessId: business.id,
            storeId: store.id,
        });

        const payloadMock = {
            centsCustomerId: centsCustomer.id,
            businessId: business.id,
            creditAmount: 10,
        };

        const result = await CreditHistory.withdrawCredits(payloadMock, undefined);

        expect(result).to.be.eql(undefined);
    });

    it('creditHistory model withdrawCredits static method should create an entity if credits enough', async () => {
        const centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        const business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        const store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        await factory.create(FACTORIES_NAMES.storeCustomer, {
            centsCustomerId: centsCustomer.id,
            businessId: business.id,
            storeId: store.id,
        });
        await factory.create(FACTORIES_NAMES.creditHistory, {
            customerId: centsCustomer.id,
            reasonId: 1,
            businessId: business.id,
            amount: 20,
        })

        const payloadMock = {
            centsCustomerId: centsCustomer.id,
            businessId: business.id,
            creditAmount: 10,
        };

        const result = await CreditHistory.withdrawCredits(payloadMock, undefined);
        const creditHistory = await CreditHistory.query().orderBy('id', 'DESC').first();

        expect(result).not.to.be.eql(undefined);
        expect(creditHistory).to.have.property('amount').to.eql(-payloadMock.creditAmount);
        expect(creditHistory).to.have.property('reasonId').to.eql(1);
    });
});

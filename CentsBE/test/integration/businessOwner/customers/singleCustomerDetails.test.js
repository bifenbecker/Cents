const {
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseSuccess,
    assertGetResponseError,
} = require('../../../support/httpRequestsHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { generateToken } = require('../../../support/apiTestHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { ERROR_MESSAGES } = require('../../../../constants/error.messages');

const getApiEndpoint = (centsCustomerId) => {
    return `/api/v1/business-owner/customers/${centsCustomerId}`;
};

describe('test getting single customer details', function () {
    let token, centsCustomer, laundromatBusiness;

    beforeEach(async () => {
        const user = await factory.create(FN.userWithBusinessOwnerRole);

        laundromatBusiness = await factory.create(FN.laundromatBusiness, {
            userId: user.id,
        });

        centsCustomer = await factory.create(FN.centsCustomer);

        token = generateToken({ id: user.id });
    });

    itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () =>
        getApiEndpoint(centsCustomer.id),
    );

    it('should throw 404 if business customer is not found', async () => {
        await assertGetResponseError({
            url: getApiEndpoint(centsCustomer.id),
            token,
            params: { id: centsCustomer.id },
            code: 404,
            expectedError: ERROR_MESSAGES.CUSTOMER_NOT_FOUND,
        });
    });

    it('should respond successfully and customer details', async () => {
        const businessCustomer = await factory.create(FN.businessCustomer, {
            centsCustomerId: centsCustomer.id,
            businessId: laundromatBusiness.id,
            isCommercial: true,
        });

        const res = await assertGetResponseSuccess({
            url: getApiEndpoint(centsCustomer.id),
            token,
            params: { id: centsCustomer.id },
        });

        expect(res.body).to.have.property('success').to.be.true;
        expect(res.body).to.have.property('details');
        expect(res.body.details).to.have.property('id').equal(centsCustomer.id);
        expect(res.body.details).to.have.property('isCommercial').equal(businessCustomer.isCommercial);
    });

    it('should respond customer details with credits', async () => {
        await factory.create(FN.businessCustomer, {
            centsCustomerId: centsCustomer.id,
            businessId: laundromatBusiness.id,
        });

        const creditReason = await factory.create(FN.creditReason, {
            reason: 'Order Adjustment'
        });

        const creditHistory = await factory.create(FN.creditHistory, {
            businessId: laundromatBusiness.id,
            customerId: centsCustomer.id,
            reasonId: creditReason.id
        });

        const res = await assertGetResponseSuccess({
            url: getApiEndpoint(centsCustomer.id),
            token,
            params: { id: centsCustomer.id },
        });

        expect(res.body).to.have.property('success').to.be.true;
        expect(res.body).to.have.property('details');
        expect(res.body.details).to.have.property('id').equal(centsCustomer.id);
        expect(res.body.details).to.have.property('credits').to.have.lengthOf(1);
        expect(res.body.details).to.have.property('availableCredit').equal(creditHistory.amount);
    });

    it('should respond customer details with tier', async () => {
        const pricingTier = await factory.create(FN.pricingTier);

        await factory.create(FN.businessCustomer, {
            centsCustomerId: centsCustomer.id,
            businessId: laundromatBusiness.id,
            commercialTierId: pricingTier.id,
        });

        const res = await assertGetResponseSuccess({
            url: getApiEndpoint(centsCustomer.id),
            token,
            params: { id: centsCustomer.id },
        });

        expect(res.body).to.have.property('success').to.be.true;
        expect(res.body).to.have.property('details');
        expect(res.body.details).to.have.property('tier');
        expect(res.body.details.tier).to.have.property('id').equal(pricingTier.id);
    });

    it('should return 404 for archived customer for business', async () => {
        const pricingTier = await factory.create(FN.pricingTier);

        await factory.create(FN.businessCustomer, {
            centsCustomerId: centsCustomer.id,
            businessId: laundromatBusiness.id,
            commercialTierId: pricingTier.id,
            deletedAt: '2022-08-10T12:59:32.582Z'
        });

        await assertGetResponseError({
            url: getApiEndpoint(centsCustomer.id),
            token,
            params: { id: centsCustomer.id },
            code: 404,
            expectedError: ERROR_MESSAGES.CUSTOMER_NOT_FOUND,
        });
    });
});

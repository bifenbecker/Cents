const {
    validateFillBalance,
} = require('../../../validations/liveLink/customer/payments/fillBalanceValidation');
const { expect } = require('../../support/chaiHelper');

describe('fillBalanceValidation', function () {
    it('should return error if credits less than 5', function () {
        const res = validateFillBalance({ credits: 4 });
        expect(res)
            .to.have.property('error')
            .with.property('message')
            .eql('Credits are required and should be equal or greater than 5');
    });
    it('should return error if payment method token is missed', function () {
        const res = validateFillBalance({ credits: 10 });
        expect(res)
            .to.have.property('error')
            .with.property('message')
            .eql('Payment method must be provided');
    });
    it('should return error if storeId is missed', function () {
        const res = validateFillBalance({
            credits: 10,
            paymentMethodToken: 'pay-with-cents',
        });
        expect(res)
            .to.have.property('error')
            .with.property('message')
            .eql('Store Id must be provided');
    });
    it("should return error null if payload i's valid", function () {
        const res = validateFillBalance({
            credits: 10,
            paymentMethodToken: 'pay-with-cents',
            storeId: 12,
        });
        expect(res).to.have.property('value').deep.equal({
            credits: 10,
            paymentMethodToken: 'pay-with-cents',
            storeId: 12,
        });
        expect(res).to.have.property('error').to.be.null;
    });
});

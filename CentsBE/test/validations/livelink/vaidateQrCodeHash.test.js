const { expect } = require('../../support/chaiHelper');

const validateQrCodeHash = require('../../../validations/validateQrCodeHash');

describe('validateQrCodeHash', () => {
    it('should return error if hash has less than 4 symbols', () => {
        const res = validateQrCodeHash('123');
        expect(res).to.have.any.key('error');
    });

    it('should return error if hash has more than 25 symbols', () => {
        const res = validateQrCodeHash('12312312312312312312312312312312312');
        expect(res).to.have.any.key('error');
    });

    it('should return error if hash has spaces', () => {
        const res = validateQrCodeHash('123 123');
        expect(res).to.have.any.key('error');
    });

    it('should return error if hash has special characters', () => {
        const res = validateQrCodeHash('123@123');
        expect(res).to.have.any.key('error');
    });

    it('should return value and nullable error if hash is correct', () => {
        const res = validateQrCodeHash('12345');
        expect(res.error).to.be.eql(null);
    });
});

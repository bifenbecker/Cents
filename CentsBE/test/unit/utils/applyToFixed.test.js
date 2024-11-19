require('../../testHelper');
const applyToFixed = require('../../../utils/applyToFixed');
const { expect } = require('../../support/chaiHelper');

describe('test applyToFixed util', () => {
    it('should format a number with default precision', () => {
        expect(applyToFixed(2.456)).to.equal(2.46);
    });

    it('should format a number set precision', () => {
        expect(applyToFixed(2.456, 1)).to.equal(2.5);
    });

    it('should return zero for null input', () => {
        expect(applyToFixed(null)).to.equal(0);
    });

    it('should return NaN for an invalid input', () => {
        expect(applyToFixed('2.456value')).to.be.NaN;
        expect(applyToFixed()).to.be.NaN;
    });
});

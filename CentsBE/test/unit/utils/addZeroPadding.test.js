require('../../testHelper');
const addZeroPadding = require('../../../utils/addZeroPadding');
const { expect } = require('../../support/chaiHelper');

describe('test addZeroPadding util', () => {
    it('should add zero padding to a string', () => {
        expect(addZeroPadding('123')).to.equal('00000123');
    });

    it("shouldn't add zero padding to a long string", () => {
        expect(addZeroPadding('123456789')).to.equal('123456789');
    });
});

require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const { formatToKebabCase } = require('../../../../utils/formatters/formatToKebabCase');

describe('test formatToKebabCase', () => {
    it('with invalid string', async () => {
        const invalidString = 'string!!';
        const result = formatToKebabCase(invalidString);

        expect(result).to.be.false;
    });

    it('with empty sting', async () => {
        const result = formatToKebabCase('');

        expect(result).equal('');
    });

    it('with unformatted valid string', async () => {
        const unformattedValidString = 'Un FORMATTED String 123';
        const formattedString = 'un-formatted-string-123';
        const result = formatToKebabCase(unformattedValidString);

        expect(result).equal(formattedString);
    });
});

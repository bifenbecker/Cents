require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    convertCentsToDollars,
} = require('../../../utils/convertMoneyUnits');

describe('test convertMoneyUnits', () => {
    describe('test convertCentsToDollars', () => {
        it('should return reject if Nan is passed', () => {
            const amountInCentsMock = '3663j';

            try {
                convertCentsToDollars(amountInCentsMock);
            } catch (error) {
                expect(error.message).to.eql(
                    'Not a number passed to function',
                );
            }
        });

        it('should convert cents to dollars if passed string with number', () => {
            const amountInCentsMock = '3663';

            const result = convertCentsToDollars(amountInCentsMock);

            expect(result).to.be.eql(Number(amountInCentsMock) / 100);
        });
    });
});

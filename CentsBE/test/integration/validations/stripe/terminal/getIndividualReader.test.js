require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const validateRequest = require('../../../../../validations/stripe/terminal/getIndividualReader');

describe('test getIndividualReader validation', () => {
    it('should return true if readerId is defined', async () => {
        const request = {
            params: {
                readerId: 'tmr_test',
            }
        };
        const isValid = validateRequest(request);
        expect(isValid).to.be.true;
    });

    it('should return false if readerId is undefined', async () => {
        const request = {
            params: {},
        };
        const isValid = validateRequest(request);
        expect(isValid).to.be.false;
    });
});

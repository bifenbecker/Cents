require('../../../../../testHelper');
const { expect } = require('../../../../../support/chaiHelper');
const validateRequest = require('../../../../../../validations/employeeTab/services/getIndividualServicePrice');

describe('test getIndividualServicePrice validation', () => {
    it('should return true if servicePriceId is defined', async () => {
        const request = {
            params: {
                servicePriceId: 1,
            }
        };
        const isValid = validateRequest(request);
        expect(isValid).to.be.true;
    });

    it('should return false if servicePriceId is undefined', async () => {
        const request = {
            params: {},
        };
        const isValid = validateRequest(request);
        expect(isValid).to.be.false;
    });
});

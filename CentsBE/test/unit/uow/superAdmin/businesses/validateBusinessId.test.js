require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const validateBusinessId = require('../../../../../validations/superAdmin/businesses/validateBusinessId');

describe('test validateBusinessId validation', () => {
    it('should return true if id is defined', async () => {
        const request = {
            params: {
                id: 1,
            }
        };
        const isValid = validateBusinessId(request);
        expect(isValid).to.be.true;
    });

    it('should return false if id is undefined', async () => {
        const request = {
            params: {},
        };
        const isValid = validateBusinessId(request);
        expect(isValid).to.be.false;
    });
});
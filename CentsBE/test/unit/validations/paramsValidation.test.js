require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { validateParamsIdType } = require('../../../validations/paramsValidation');

describe('test paramsValidation common validations', () => {
    describe('test validateParamsIdType', () => {
        it('should return true if id is defined', async () => {
            const request = {
                params: {
                    id: 1,
                }
            };
            const isValid = validateParamsIdType(request);
            expect(isValid).to.be.true;
        });
    
        it('should return false if id is undefined', async () => {
            const request = {
                params: {},
            };
            const isValid = validateParamsIdType(request);
            expect(isValid).to.be.false;
        });
    })
});
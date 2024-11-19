require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const calculatePerPoundPrice = require('../../../commons/priceCalculator.js');

describe('test calculatePerPoundPrice common function', () => {    
    it('should return 0 if totalWeight is 0', async () => { 
        const price = 5;
        const totalWeight = 0;
        const result = calculatePerPoundPrice(price, totalWeight);
        expect(result).to.equal(0);
    });

    it('should return 0 if price is 0 and hasMinPrice is false', async () => { 
        const totalWeight = 5;
        const price = 0;
        const hasMinPrice = false;
        const result = calculatePerPoundPrice(price, totalWeight, null, null, hasMinPrice);
        expect(result).to.equal(0);
    });

    it('should return variable pricing is hasMinPrice is true and remainingWeight is < 0', async () => { 
        const totalWeight = 5;
        const price = 2;
        const flatPrice = 9;
        const flatRateWeight = 12;
        const hasMinPrice = true;
        const expectedResult = (flatPrice + 0).toFixed(2);
        const result = calculatePerPoundPrice(price, totalWeight, flatRateWeight, flatPrice, hasMinPrice);
        expect(result).to.equal(expectedResult);
    });

    it('should return variable pricing is hasMinPrice is true and remainingWeight is > 0', async () => { 
        const totalWeight = 18;
        const price = 2;
        const flatPrice = 9;
        const flatRateWeight = 12;
        const hasMinPrice = true;
        const expectedRemainingWeight = (totalWeight - flatRateWeight);
        const expectedVariablePrice = price * expectedRemainingWeight;
        const expectedResult = (flatPrice + expectedVariablePrice).toFixed(2);
        const result = calculatePerPoundPrice(price, totalWeight, flatRateWeight, flatPrice, hasMinPrice);
        expect(result).to.equal(expectedResult);
    });

    it('should return price * weight if hasMinPrice is false', async () => { 
        const totalWeight = 18;
        const price = 2;
        const flatPrice = 9;
        const flatRateWeight = 12;
        const hasMinPrice = false;
        const expectedResult = (price * totalWeight);
        const result = calculatePerPoundPrice(price, totalWeight, flatRateWeight, flatPrice, hasMinPrice);
        expect(result).to.equal(expectedResult);
    });
});

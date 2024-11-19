require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { createPricing, updatePricing } = require('../../../commons/pricing');
const { MACHINE_PRICING_TYPES } = require('../../../constants/constants');

describe('test pricing common functions', () => {
    describe('test pricing/createPricing function', () => {
        it('should return array of objects including the field "type"', async () => {
            const machineIdMock = 45353;
            const priceFirstMock = { id: 45, loadId: 67, price: 10 };
            const priceSecondMock = { id: 47, loadId: 77, price: 11 };
            const pricesMock = [priceFirstMock, priceSecondMock];

            const result = createPricing(pricesMock, machineIdMock);

            expect(result).to.be.an('array');
            for (const resultElement of result) {
                expect(resultElement).to.have.property('machineId').to.be.a('number');
                expect(resultElement).to.have.property('loadId').to.be.a('number');
                expect(resultElement).to.have.property('price').to.be.a('number');
                expect(resultElement).to.have.property('type').to.be.a('string');
            }
            result.forEach((resultElement, idx) => {
                expect(resultElement).to.deep.equal({
                    machineId: machineIdMock,
                    loadId: pricesMock[idx].loadId,
                    price: pricesMock[idx].price,
                    type: MACHINE_PRICING_TYPES.LOAD_TEMPERATURE,
                });
            });
        });

        it('should return array of objects without the field "type"', async () => {
            const machineIdMock = 45353;
            const priceFirstMock = { id: 45, loadId: null, price: 10 };
            const priceSecondMock = { id: 47, loadId: null, price: 11 };
            const pricesMock = [priceFirstMock, priceSecondMock];

            const result = createPricing(pricesMock, machineIdMock);

            expect(result).to.be.an('array');
            for (const resultElement of result) {
                expect(resultElement).to.have.property('machineId').to.be.a('number');
                expect(resultElement).to.have.property('loadId').to.be.null;
                expect(resultElement).to.have.property('price').to.be.a('number');
                expect(resultElement).not.to.have.property('type');
            }
            result.forEach((resultElement, idx) => {
                expect(resultElement).to.deep.equal({
                    machineId: machineIdMock,
                    loadId: pricesMock[idx].loadId,
                    price: pricesMock[idx].price,
                });
            });
        })
    });

    describe('test pricing/updatePricing function', () => {
        it('should return array of objects', async () => {
            const priceFirstMock = { id: 45, loadId: 67, price: 10 };
            const priceSecondMock = { id: 47, loadId: 77, price: 11 };
            const pricesMock = [priceFirstMock, priceSecondMock];

            const result = updatePricing(pricesMock);

            expect(result).to.be.an('array');
            for (const resultElement of result) {
                expect(resultElement).to.have.property('id').to.be.a('number');
                expect(resultElement).to.have.property('isDeleted').to.be.a('boolean');
                expect(resultElement).to.have.property('deletedAt').to.be.instanceOf(Date);
            }
            result.forEach((resultElement, idx) => {
                expect(resultElement).to.includes({
                    id: pricesMock[idx].id,
                    isDeleted: true,
                });
            });
        });
    });
});

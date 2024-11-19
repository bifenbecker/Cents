require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const getIsTaxable = require('../../../../../services/orders/queries/getIsTaxable');

describe('test getIsTaxable', () => {
    const inventoryItems = [{
        refItem: [{
            inventoryItem: {
                isTaxable: false,
            }
        }],
    }];

    const servicePriceItems = [{
        refItem: [{
            servicePrice: {
                isTaxable: true,
            },
        }],
    }];

    it('should fail when items not passed', async () => {
        let isRejected = false;
        try {
            getIsTaxable();
        } catch {
            isRejected = true;
        }
        expect(isRejected).to.be.true;
    });

    it('should return false in some cases', async () => {
        expect(getIsTaxable([])).to.be.false;
        expect(getIsTaxable([{
            refItem: [{}],
        }])).to.be.false;
    });

    it('should return isTaxable for inventoryItem', async () => {
        const isTaxable = getIsTaxable(inventoryItems);
        expect(isTaxable).to.be.false;
    });

    it('should return isTaxable for servicePrice', async () => {
        const isTaxable = getIsTaxable(servicePriceItems);
        expect(isTaxable).to.be.true;
    });
});

require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const {
    getTotalTurnTimeInMinutes,
} = require('../../../../utils/machines/turnUtil');

describe('test turnUtil', () => {
    describe('test getTotalTurnTimeInMinutes', () => {
        it('should return 0 if there is empty array passed', () => {
            const turnLineItemsMock = [];

            const result = getTotalTurnTimeInMinutes(turnLineItemsMock);

            expect(result).to.be.eql(0);
        });

        it('should calculate total turn time', () => {
            const turnLineItemMock = {
                id: 1,
                turnId: 1,
                turnTime: '12',
                quantity: 1,
                unitPriceInCents: 120,
            };
            const turnLineItemsMock = [turnLineItemMock, turnLineItemMock];

            const result = getTotalTurnTimeInMinutes(turnLineItemsMock);

            expect(result).to.be.eql(24);
        });
    });
});

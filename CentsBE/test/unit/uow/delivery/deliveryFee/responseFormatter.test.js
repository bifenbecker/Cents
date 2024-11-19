require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const formatResponse = require('../../../../../uow/delivery/deliveryFee/responseFormatter');

describe('test format response', () => {
    it('should format the ownDeliveryStore object in the response', async () => {
        const initialPayload = {
            storeDeliverySettings: {
                storeId: 123,
            },
            deliveryFeeInCents: 10.99,
        };
        const result = formatResponse(initialPayload);

        expect(result).to.have.property('ownDeliveryStore');
        expect(result.ownDeliveryStore.storeId).to.equal(
            initialPayload.storeDeliverySettings.storeId,
        );
        expect(result.ownDeliveryStore.deliveryFeeInCents).to.equal(
            initialPayload.deliveryFeeInCents,
        );
    });

    it('should return empty object when storeId dne', async () => {
        const initialPayload = {
            storeDeliverySettings: undefined,
            deliveryFeeInCents: undefined,
        };
        const result = formatResponse(initialPayload);

        expect(result).to.be.empty;
    });

    it('should throw Error without payload', () => {
        expect(() => formatResponse()).to.throw(Error);
    });
});

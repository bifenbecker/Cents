require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const calculateOwnDriverDeliveryFee = require('../../../../../uow/delivery/deliveryFee/calculateOwnDriverDeliveryFee');

const INITIAL_PAYLOAD = {
    storeDeliverySettings: {
        deliveryFeeInCents: 500,
        returnDeliveryFeeInCents: 300,
    },
    orderId: undefined,
    pickup: {},
};

function checkIfDefaultDeliveryFee(payload) {
    // act
    const result = calculateOwnDriverDeliveryFee(payload);

    // assert
    expect(result).to.have.property('deliveryFeeInCents');
    expect(result.deliveryFeeInCents).to.equal(
        payload.storeDeliverySettings.deliveryFeeInCents / 2,
    );
}

describe('test calculate delivery fee', () => {
    it('should return NaN if storeDeliverySettings do not exist', async () => {
        const payload = {
            ...INITIAL_PAYLOAD,
            storeDeliverySettings: undefined,
        };
        const result = calculateOwnDriverDeliveryFee(payload);

        expect(result).to.have.property('deliveryFeeInCents');
        expect(isNaN(result.deliveryFeeInCents)).to.be.true;
    });

    it('should use commercial delivery fee when applicable', async () => {
        const payload = {
            ...INITIAL_PAYLOAD,
            pricingTier: {
                commercialDeliveryFeeInCents: 100,
            },
        };
        const result = calculateOwnDriverDeliveryFee(payload);

        expect(result).to.have.property('deliveryFeeInCents');
        expect(result.deliveryFeeInCents).to.equal(
            payload.pricingTier.commercialDeliveryFeeInCents / 2,
        );
    });

    describe('test return only delivery fee', () => {
        it('should use return only delivery fee when applicable', async () => {
            const payload = {
                ...INITIAL_PAYLOAD,
                orderId: '123',
            };
            const result = calculateOwnDriverDeliveryFee(payload);

            expect(result).to.have.property('deliveryFeeInCents');
            expect(result.deliveryFeeInCents).to.equal(
                payload.storeDeliverySettings.returnDeliveryFeeInCents,
            );
        });

        it('should not use return only delivery fee when missing orderId', async () => {
            const payload = {
                ...INITIAL_PAYLOAD,
            };

            checkIfDefaultDeliveryFee(payload);
        });

        it('should not use return only delivery fee when pickup provider exists', async () => {
            const payload = {
                ...INITIAL_PAYLOAD,
                orderId: 123,
                pickup: { deliveryProvider: 'DOORDASH' },
            };

            checkIfDefaultDeliveryFee(payload);
        });

        it('should not use return only delivery fee when dne', async () => {
            const payload = {
                ...INITIAL_PAYLOAD,
                storeDeliverySettings: {
                    ...INITIAL_PAYLOAD.storeDeliverySettings,
                    returnDeliveryFeeInCents: null,
                },
                orderId: 123,
            };

            checkIfDefaultDeliveryFee(payload);
        });
    });

    it('should throw Error without payload', () => {
        expect(() => calculateOwnDriverDeliveryFee()).to.throw(Error);
    });
});

require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const getConvenienceFee = require('../../../../uow/order/getConvenienceFee');

describe('test getConvenienceFee UoW', () => {
    let business, business1, convenienceFee, convenienceFee1;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        business1 = await factory.create('laundromatBusiness');

        convenienceFee = await factory.create('convenienceFee', {
            businessId: business.id,
        });
        convenienceFee1 = await factory.create('convenienceFee', {
            businessId: business1.id,
        });
    });

    it('should query by convenienceFeeId when provided', async () => {
        // arrange
        const payload = {
            convenienceFeeId: convenienceFee.id,
            store: { businessId: convenienceFee.businessId },
        };

        // act
        const res = await getConvenienceFee(payload);

        // assert
        expect(res.convenienceFee).to.exist;
        expect(res.convenienceFee).to.have.property('id', payload.convenienceFeeId);
    });

    it('should return null when convenienceFeeId is not provided', async () => {
        // arrange
        const payload = {};

        // act
        const res = await getConvenienceFee(payload);

        // assert
        expect(res.convenienceFee).to.be.null;
    });

    it('should return undefined when no results exist', async () => {
        // arrange
        const payload = { convenienceFeeId: 42 };

        // act
        const res = await getConvenienceFee(payload);

        // assert
        expect(res.convenienceFee).to.be.undefined;
    });

    it('should return convenienceFee = 0 when removeConvenienceFee is true', async () => {
        // arrange
        const payload = {
            convenienceFeeId: convenienceFee.id,
            store: { businessId: convenienceFee.businessId },
            removeConvenienceFee: true,
        };

        // act
        const res = await getConvenienceFee(payload);

        // assert
        expect(res.convenienceFee).to.exist;
        expect(res.convenienceFee).to.have.property('id', payload.convenienceFeeId);
        expect(res.convenienceFee.fee).to.equal(0);
    });

    it('should return the regular convenienceFee when removeConvenienceFee is false', async () => {
        // arrange
        const payload = {
            convenienceFeeId: convenienceFee.id,
            store: { businessId: convenienceFee.businessId },
            removeConvenienceFee: false,
        };

        // act
        const res = await getConvenienceFee(payload);

        // assert
        expect(res.convenienceFee).to.exist;
        expect(res.convenienceFee).to.have.property('id', payload.convenienceFeeId);
        expect(res.convenienceFee.fee).to.equal(convenienceFee.fee);
    });

    it('should return the regular convenienceFee when removeConvenienceFee does not exist', async () => {
        // arrange
        const payload = {
            convenienceFeeId: convenienceFee.id,
            store: { businessId: convenienceFee.businessId },
        };

        // act
        const res = await getConvenienceFee(payload);

        // assert
        expect(res.convenienceFee).to.exist;
        expect(res.convenienceFee).to.have.property('id', payload.convenienceFeeId);
        expect(res.convenienceFee.fee).to.equal(convenienceFee.fee);
    });
});

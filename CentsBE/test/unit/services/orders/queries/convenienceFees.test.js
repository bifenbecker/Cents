require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { transaction } = require('objection');
const Model = require('../../../../../models');
const {
    getConvenienceFeeById,
    getConvenienceFeeByBusinessId,
    formatConvenienceFee,
    calculateConvenienceFee,
} = require('../../../../../services/orders/queries/convenienceFees');

describe('test convenienceFees helpers', () => {
    let business, convenienceFee, txn;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');

        convenienceFee = await factory.create('convenienceFee', {
            businessId: business.id,
        });

        await factory.create('convenienceFee', {
            businessId: business.id,
            isDeleted: true,
        });

        txn = await transaction.start(Model.knex());
    });

    describe('test getConvenienceFeeById', () => {
        it('should get convenience fee by id', async () => {
            // act
            const res = await getConvenienceFeeById(txn, convenienceFee.id);
            await txn.commit();

            // assert
            expect(res).to.have.property('id', convenienceFee.id);
        });
    });

    describe('test getConvenienceFeeByBusinessId', () => {
        it('should get convenience fee by business id', async () => {
            // arrange
            await factory.create('convenienceFee');

            // act
            const res = await getConvenienceFeeByBusinessId(txn, business.id);
            await txn.commit();

            // assert
            expect(res).to.have.property('id', convenienceFee.id);
            expect(res).to.have.property('businessId', business.id);
        });
    });

    describe('test formatConvenienceFee', () => {
        it('should format percentage convenience fee', async () => {
            // arrange
            const percentageConvenienceFee = await factory.create('convenienceFee', {
                businessId: business.id,
                feeType: 'PERCENTAGE',
            });
            const orderItemsTotal = 100;
            const promotionAmount = 25;

            // act
            const convenienceAmount = formatConvenienceFee(
                percentageConvenienceFee,
                orderItemsTotal,
                promotionAmount,
            );

            // assert
            expect(convenienceAmount).to.equal(
                (orderItemsTotal - promotionAmount) * (percentageConvenienceFee.fee / 100),
            );
        });

        it('should format fixed convenience fee', async () => {
            // arrange
            const fixedConvenienceFee = await factory.create('convenienceFee', {
                businessId: business.id,
                feeType: 'FIXED',
            });
            const orderItemsTotal = 100;
            const promotionAmount = 25;

            // act
            const convenienceAmount = formatConvenienceFee(
                fixedConvenienceFee,
                orderItemsTotal,
                promotionAmount,
            );

            // assert
            expect(convenienceAmount).to.equal(Number(fixedConvenienceFee.fee).toFixed(2));
        });
    });

    describe('test calculateConvenienceFee', () => {
        it('should calculate convenience fee', async () => {
            // arrange
            const orderItemsTotal = 100;
            const promotionAmount = 25;

            // act
            const convenienceAmount = await calculateConvenienceFee(
                txn,
                convenienceFee.id,
                orderItemsTotal,
                promotionAmount,
            );

            // assert
            expect(convenienceAmount).to.equal(
                (orderItemsTotal - promotionAmount) * (convenienceFee.fee / 100),
            );
        });
    });
});

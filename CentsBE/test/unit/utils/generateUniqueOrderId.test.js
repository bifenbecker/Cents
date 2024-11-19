require('../../testHelper');

const moment = require('moment');

const factory = require('../../factories');
const { expect } = require('../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const generateUniqueOrderId = require('../../../utils/generateUniqueOrderId');

describe('test generateUniqueOrderId util', () => {
    let defaultParams;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        centsCustomer = await factory.create(FN.centsCustomer);

        defaultParams = {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
        };
    });

    it('should generate same unique order ids', () => {
        // arrange
        const currentTime = moment(1662684961);
        const currentTimePlus2Seconds = currentTime.clone().add(500, 'milliseconds');

        // act
        const initialOrderId = generateUniqueOrderId(defaultParams, currentTime.toDate());
        const duplicateOrderId = generateUniqueOrderId(
            defaultParams,
            currentTimePlus2Seconds.toDate(),
        );

        // assert
        expect(initialOrderId).to.equal(duplicateOrderId);
    });

    describe('should generate different unique order ids', () => {
        it('more than 10 seconds in time difference', () => {
            // arrange
            const currentTime = moment(1662684961);
            const currentTimePlus15Seconds = currentTime.clone().add(15, 'seconds');

            // act
            const initialOrderId = generateUniqueOrderId(defaultParams, new Date(currentTime));
            const duplicateOrderId = generateUniqueOrderId(
                defaultParams,
                new Date(currentTimePlus15Seconds),
            );

            // assert
            expect(initialOrderId).not.to.equal(duplicateOrderId);
        });

        it('different cents customer', async () => {
            // arrange
            const newCentsCustomer = await factory.create(FN.centsCustomer);

            const params = {
                storeId: store.id,
                centsCustomerId: newCentsCustomer.id,
            };
            const currentTime = moment(1662684961);
            const currentTimePlus2Seconds = currentTime.clone().add(2, 'seconds');

            // act
            const initialOrderId = generateUniqueOrderId(defaultParams, new Date(currentTime));
            const duplicateOrderId = generateUniqueOrderId(
                params,
                new Date(currentTimePlus2Seconds),
            );

            // assert
            expect(initialOrderId).not.to.equal(duplicateOrderId);
        });

        it('different store', async () => {
            // arrange
            const newStore = await factory.create(FN.store);

            const params = {
                storeId: newStore.id,
                centsCustomerId: centsCustomer.id,
            };
            const currentTime = moment(1662684961);
            const currentTimePlus2Seconds = currentTime.clone().add(2, 'seconds');

            // act
            const initialOrderId = generateUniqueOrderId(defaultParams, new Date(currentTime));
            const duplicateOrderId = generateUniqueOrderId(
                params,
                new Date(currentTimePlus2Seconds),
            );

            // assert
            expect(initialOrderId).not.to.equal(duplicateOrderId);
        });
    });
});

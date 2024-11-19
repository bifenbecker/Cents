require('../../testHelper');

const { expect } = require('../../support/chaiHelper');
const { deliveryProviders, ORDER_TYPES } = require('../../../constants/constants');
const { getOrderDeliveryFeeDetails } = require('../../../utils/getOrderDeliveryFeeDetails');

describe('test getOrderDeliveryFeeDetails', () => {
    describe('test get order delivery fee details', () => {
        const thirdPartyDelivery = {
            id: '123',
            fee: 999,
            delivery_tracking_url: 'tracking-url',
        };
        const orderType = ORDER_TYPES.ONLINE;
        const deliveryFeeInfo = { ownDeliveryStore: { deliveryFeeInCents: 400 } };
        const settings = {
            deliveryFeeInCents: 500,
            returnOnlySubsidyInCents: 300,
            subsidyInCents: 500,
        };

        it('should return own driver delivery fee', async () => {
            // arrange
            const orderDelivery = {
                deliveryProvider: deliveryProviders.OWN_DRIVER,
            };

            // act
            const res = getOrderDeliveryFeeDetails({
                orderDelivery,
                thirdPartyDelivery,
                settings,
                orderType,
                deliveryFeeInfo,
            });

            // assert
            expect(res).to.have.property('totalDeliveryCost', 4);
            expect(res).to.have.property('thirdPartyDeliveryCostInCents', 0);
            expect(res).to.have.property('subsidyInCents', 0);
            expect(res).to.have.keys([
                'totalDeliveryCost',
                'thirdPartyDeliveryId',
                'thirdPartyDeliveryCostInCents',
                'subsidyInCents',
                'trackingUrl',
            ]);
        });

        it('should return third party delivery fee', async () => {
            // arrange
            const orderDelivery = {
                deliveryProvider: deliveryProviders.DOORDASH,
            };

            // act
            const res = getOrderDeliveryFeeDetails({
                orderDelivery,
                thirdPartyDelivery,
                settings,
                orderType,
                deliveryFeeInfo,
            });

            // assert
            expect(res).to.have.keys([
                'totalDeliveryCost',
                'thirdPartyDeliveryId',
                'thirdPartyDeliveryCostInCents',
                'subsidyInCents',
                'trackingUrl',
            ]);
            expect(res).to.have.property('totalDeliveryCost', '4.99');
            expect(res).to.have.property('thirdPartyDeliveryId', thirdPartyDelivery.id);
            expect(res).to.have.property('thirdPartyDeliveryCostInCents', 999);
            expect(res).to.have.property('subsidyInCents', 500);
            expect(res).to.have.property('trackingUrl', thirdPartyDelivery.delivery_tracking_url);
        });
    });
});

require('../../../../testHelper');
const mapOrderDelivery = require('../../../../../uow/liveLink/serviceOrders/getMappedOrderDelivery');
const factory = require('../../../../factories');
const { orderDeliveryStatuses } = require('../../../../../constants/constants');
const { expect } = require('../../../../support/chaiHelper');

describe('test getMappedOrderDelivery', () => {
    describe('test mapOrderDelivery', () => {
        let store;
        let centsCustomer;
        let storeCustomer;
        let serviceOrder;
        let order;
        let address;
        let orderDelivery;
        let deliveryFeeInfo;
        let expectedResult;

        beforeEach(async () => {
            store = await factory.create('store');
            await factory.create('ownDeliverySetting', {
                storeId: store.id,
                deliveryFeeInCents: 500,
            });
            centsCustomer = await factory.create('centsCustomer');
            storeCustomer = await factory.create('storeCustomer', {
                centsCustomerId: centsCustomer.id,
                storeId: store.id,
                businessId: store.businessId,
            });
            serviceOrder = await factory.create('serviceOrder', {
                storeId: store.id,
                storeCustomerId: storeCustomer.id,
            });
            order = await factory.create('serviceOrderMasterOrder', {
                orderableId: serviceOrder.id,
            });
            address = await factory.create('centsCustomerAddress', {
                centsCustomerId: centsCustomer.id,
            });
            orderDelivery = await factory.create('orderDelivery', {
                status: orderDeliveryStatuses.EN_ROUTE_TO_DROP_OFF,
                orderId: order.id,
                postalCode: '10003',
            });
            deliveryFeeInfo = { ownDeliveryStore: { deliveryFeeInCents: 500 } };

            expectedResult = {
                storeId: store.id,
                storeCustomerId: storeCustomer.id,
                orderId: order.id,
                address1: address.address1,
                address2: address.address2 || null,
                city: address.city,
                firstLevelSubdivisionCode: address.firstLevelSubdivisionCode,
                postalCode: address.postalCode,
                countryCode: address.countryCode,
                instructions: {
                    instructions: address.instructions,
                    leaveAtDoor: address.leaveAtDoor,
                },
                customerName: `${storeCustomer.firstName} ${storeCustomer.lastName}`,
                customerPhoneNumber: storeCustomer.phoneNumber,
                customerEmail: storeCustomer.email,
                deliveryProvider: orderDelivery.deliveryProvider,
                deliveryWindow: orderDelivery.deliveryWindow,
                type: orderDelivery.type,
                status: orderDelivery.status,
                centsCustomerAddressId: address.centsCustomerAddressId,
                timingsId: orderDelivery.timingsId,
                courierTip: Number(orderDelivery.courierTip),
                totalDeliveryCost: 5,
                thirdPartyDeliveryId: null,
                thirdPartyDeliveryCostInCents: 0,
                subsidyInCents: 0,
                trackingUrl: null,
            };
        });

        it('with customerEmail', async () => {
            // act
            const res = mapOrderDelivery({
                store,
                order,
                orderType: 'serviceOrder',
                storeCustomer,
                address,
                orderDelivery,
                thirdPartyDelivery: {},
                deliveryFeeInfo,
            });

            // assert
            expect(res).to.deep.equal(expectedResult);
        });

        it('without customerEmail', async () => {
            storeCustomer.email = null;
            expectedResult.customerEmail = null;

            // act
            const res = mapOrderDelivery({
                store,
                order,
                orderType: 'serviceOrder',
                storeCustomer,
                address,
                orderDelivery,
                thirdPartyDelivery: {},
                deliveryFeeInfo,
            });

            // assert
            expect(res).to.deep.equal(expectedResult);
        });
    });
});

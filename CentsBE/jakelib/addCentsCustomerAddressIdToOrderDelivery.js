const { task, desc } = require('jake');
const JakeTasksLog = require('../models/jakeTasksLog');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const OrderDelivery = require('../models/orderDelivery');

desc('Add centsCustomerAddressId to order delivery');
task('add_centsCustomerAddressId_to_orderDelivery', async () => {
    try {
        const orderDeliveries = await OrderDelivery.query()
            .withGraphFetched('[customer.[centsCustomer.addresses]]')
            .where('centsCustomerAddressId', null);
        if (orderDeliveries.length) {
            await Promise.all(
                orderDeliveries
                    .filter(
                        (orderDelivery) => orderDelivery.customer.centsCustomer.addresses.length,
                    )
                    .map(async (order) => {
                        const { addresses } = order.customer.centsCustomer;
                        const matchedAddress = addresses.find(
                            (address) =>
                                order.address1 === address.address1 &&
                                order.city === address.city &&
                                order.firstLevelSubDivisionCode ===
                                    address.firstLevelSubDivisionCode &&
                                order.postalCode === address.postalCode &&
                                order.countryCode === address.countryCode,
                        );
                        if (matchedAddress) {
                            await order.$query().patch({
                                centsCustomerAddressId: matchedAddress.id,
                            });
                        }
                    }),
            );
        }
        await JakeTasksLog.query().insert({
            taskName: 'add_centsCustomerAddressId_to_orderDelivery',
        });
    } catch (error) {
        LoggerHandler('error', error);
    }
});

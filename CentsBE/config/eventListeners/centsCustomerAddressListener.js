const eventEmitter = require('../eventEmitter');
const { centsCustomerAddressQueue } = require('../../appQueues');

eventEmitter.on('customerAddressCreated', (customerAddress) => {
    centsCustomerAddressQueue.add('customer_address_created', { customerAddress }, { delay: 5000 });
});

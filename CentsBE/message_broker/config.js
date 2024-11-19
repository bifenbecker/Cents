const os = require('os');

const namedPrefix = process.env.QUEUE_PREFIX || os.hostname();
const exchangeName = `${namedPrefix}_ex.api`;
const queueName = `${namedPrefix}_qu.api`;
const bindingName = `${exchangeName} -> ${queueName}`;
const subsQueue = `${namedPrefix}_qu.devices`;
const subsBinding = `${namedPrefix}_ex.devices -> ${namedPrefix}_qu.devices`;

module.exports = {
    vhosts: {
        '/': {
            publicationChannelPools: {
                confirmPool: {
                    autostart: true,
                },
            },
            connection: {
                heartbeat: 1,
                socketOptions: {
                    timeout: 1000,
                },
                url: process.env.RABBITMQ_URL,
            },
            exchanges: {
                [exchangeName]: {
                    type: 'direct',
                },
                [`${namedPrefix}_ex.devices`]: {
                    type: 'direct',
                },
            },
            queues: [queueName, subsQueue],
            bindings: [bindingName, subsBinding],
            publications: {
                cents_pub: {
                    exchange: exchangeName,
                    options: {
                        persistent: false,
                    },
                },
            },
            subscriptions: {
                cents_sub: {
                    queue: subsQueue,
                },
                // redeliveries: {
                //     limit: 10,
                //     counter: 'api_counter_stratragy',
                // },
            },
            // redeliveries: {
            //     counters: {
            //         api_counter_stratragy: {
            //             type: 'api_message_deliver',
            //             size: 1000,
            //         },
            //     },
            // },
        },
    },
};

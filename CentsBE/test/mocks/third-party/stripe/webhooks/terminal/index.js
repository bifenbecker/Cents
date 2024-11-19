/**
 * Generate the expected incoming webhook event for a terminal.reader.action_succeeded event 
 */
function generateSuccessfulTerminalStripeWebhook() {
    return {
        id: 'evt_test',
        object: 'event',
        api_version: '2020-08-27; terminal_server_driven_beta=v1',
        created: 1661807662,
        data: {
            object: {
                id: 'tmr_test',
                object: 'terminal.reader',
                action: {
                    failure_code: null,
                    failure_message: null,
                    process_payment_intent: {
                        payment_intent: 'pi_test',
                    },
                    status: 'succeeded',
                    type: 'process_payment_intent',
                },
                device_sw_version: '2.6.4.0',
                device_type: 'bbpos_wisepos_e',
                ip_address: '10.0.0.103',
                label: 'Hi Bean',
                livemode: false,
                location: 'tml_test',
                metadata: {},
                serial_number: 'test_serial',
                status: 'online',
            },
        },
        livemode: false,
        pending_webhooks: 1,
        request: {
            id: null,
            idempotency_key: null,
        },
        type: 'terminal.reader.action_succeeded',
    };
}

/**
 * Generate the expected incoming webhook event for a terminal.reader.action_failed event 
 */
 function generateFailureTerminalStripeWebhook() {
    return {
        id: 'evt_test',
        object: 'event',
        api_version: '2020-08-27; terminal_server_driven_beta=v1',
        created: 1661806349,
        data: {
            object: {
                id: 'tmr_test',
                object: 'terminal.reader',
                action: {
                    failure_code: 'card_declined',
                    failure_message: 'Your card has insufficient funds.',
                    process_payment_intent: {
                        payment_intent: 'pi_test',
                    },
                    status: 'failed',
                    type: 'process_payment_intent',
                },
                device_sw_version: '2.6.4.0',
                device_type: 'bbpos_wisepos_e',
                ip_address: '192.168.1.167',
                label: 'Hi Bean',
                livemode: true,
                location: 'tml_test',
                metadata: {},
                serial_number: 'test_serial',
                status: 'online',
            },
        },
        livemode: true,
        pending_webhooks: 1,
        request: {
            id: null,
            idempotency_key: null,
        },
        type: 'terminal.reader.action_failed',
    };
}

module.exports = exports = {
    generateSuccessfulTerminalStripeWebhook,
    generateFailureTerminalStripeWebhook,
};

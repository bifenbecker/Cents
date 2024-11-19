const STRIPE_CREDENTIALS = {
    chargeId: 'ch_MOCKED',
    feeName: 'fee_MOCKED',
    balanceTransaction: 'txn_MOCKED',
    customerId: 'cus_MOCKED_CENTS_CUSTOMER_STRIPE',
    destinationAccountId: 'acct_MOCKED',
    paymentIntentId: 'pi_MOCKED',
    paymentMethodId: 'pm_MOCKED',
    fingerPrint: 'MOCKED_FINGER_PRINT',
    transferId: 'tr_MOCKED',
    brand: 'visa',
    charge: 'ch_MOCKED',
    receiptUrl: 'https://pay.stripe.com/receipts/MOCKED_URL',
};

const CREATE_STRIPE_INTENT_RESPONSE = {
    id: 'MOCKED_STRIPE',
    object: 'payment_intent',
    amount: 1496,
    amount_capturable: 0,
    amount_details: {
        tip: {},
    },
    amount_received: 1496,
    application: null,
    application_fee_amount: 60,
    automatic_payment_methods: null,
    canceled_at: null,
    cancellation_reason: null,
    capture_method: 'automatic',
    charges: {
        object: 'list',
        data: [
            {
                id: STRIPE_CREDENTIALS.chargeId,
                object: 'charge',
                amount: 1496,
                amount_captured: 1496,
                amount_refunded: 0,
                application: null,
                application_fee: STRIPE_CREDENTIALS.feeName,
                application_fee_amount: 60,
                balance_transaction: STRIPE_CREDENTIALS.balanceTransaction,
                billing_details: {
                    address: {
                        city: null,
                        country: null,
                        line1: null,
                        line2: null,
                        postal_code: null,
                        state: null,
                    },
                    email: null,
                    name: null,
                    phone: null,
                },
                calculated_statement_descriptor: 'TRYCENTS.COM',
                captured: true,
                created: 1652270365,
                currency: 'usd',
                customer: STRIPE_CREDENTIALS.customerId,
                description: null,
                destination: STRIPE_CREDENTIALS.destinationAccountId,
                dispute: null,
                disputed: false,
                failure_balance_transaction: null,
                failure_code: null,
                failure_message: null,
                fraud_details: {},
                invoice: null,
                livemode: false,
                metadata: {
                    orderId: '2',
                    storeId: '8',
                    customerEmail: 'user-15@gmail.com',
                    orderableType: 'ServiceOrder',
                    orderableId: '2',
                    storeCustomerId: '4',
                },
                on_behalf_of: STRIPE_CREDENTIALS.destinationAccountId,
                order: null,
                outcome: {
                    network_status: 'approved_by_network',
                    reason: null,
                    risk_level: 'normal',
                    risk_score: 11,
                    seller_message: 'Payment complete.',
                    type: 'authorized',
                },
                paid: true,
                payment_intent: STRIPE_CREDENTIALS.paymentIntentId,
                payment_method: STRIPE_CREDENTIALS.paymentMethodId,
                payment_method_details: {
                    card: {
                        amount_authorized: 1496,
                        brand: STRIPE_CREDENTIALS.brand,
                        checks: {
                            address_line1_check: null,
                            address_postal_code_check: null,
                            cvc_check: null,
                        },
                        country: 'US',
                        exp_month: 5,
                        exp_year: 2023,
                        fingerprint: STRIPE_CREDENTIALS.fingerPrint,
                        funding: 'credit',
                        installments: null,
                        last4: '4242',
                        mandate: null,
                        network: 'visa',
                        three_d_secure: null,
                        wallet: null,
                    },
                    type: 'card',
                },
                receipt_email: null,
                receipt_number: null,
                receipt_url: STRIPE_CREDENTIALS.receiptUrl,
                refunded: false,
                refunds: {
                    object: 'list',
                    data: [],
                    has_more: false,
                    total_count: 0,
                    url: `/v1/charges/${STRIPE_CREDENTIALS.chargeId}/refunds`,
                },
                review: null,
                shipping: null,
                source: null,
                source_transfer: null,
                statement_descriptor: null,
                statement_descriptor_suffix: null,
                status: 'succeeded',
                transfer: STRIPE_CREDENTIALS.transferId,
                transfer_data: {
                    amount: null,
                    destination: STRIPE_CREDENTIALS.destinationAccountId,
                },
                transfer_group: `group_${STRIPE_CREDENTIALS.paymentIntentId}`,
            },
        ],
        has_more: false,
        total_count: 1,
        url: `/v1/charges?payment_intent=${STRIPE_CREDENTIALS.paymentIntentId}`,
    },
    client_secret: `${STRIPE_CREDENTIALS.paymentIntentId}_secret_MOCKED`,
    confirmation_method: 'automatic',
    created: 1652270365,
    currency: 'usd',
    customer: STRIPE_CREDENTIALS.customerId,
    description: null,
    invoice: null,
    last_payment_error: null,
    livemode: false,
    metadata: {
        orderId: '2',
        storeId: '8',
        customerEmail: 'user-15@gmail.com',
        orderableType: 'ServiceOrder',
        orderableId: '2',
        storeCustomerId: '4',
    },
    next_action: null,
    on_behalf_of: STRIPE_CREDENTIALS.destinationAccountId,
    payment_method: STRIPE_CREDENTIALS.paymentMethodId,
    payment_method_options: {
        card: {
            installments: null,
            mandate_options: null,
            network: null,
            request_three_d_secure: 'automatic',
        },
    },
    payment_method_types: ['card'],
    processing: null,
    receipt_email: null,
    review: null,
    setup_future_usage: null,
    shipping: null,
    source: null,
    statement_descriptor: null,
    statement_descriptor_suffix: null,
    status: 'succeeded',
    total_details: {
        amount_tax: 0,
        amount_tip: null,
    },
    transfer_data: {
        destination: STRIPE_CREDENTIALS.destinationAccountId,
    },
    transfer_group: `group_${STRIPE_CREDENTIALS.paymentIntentId}`,
};

const CANCEL_STRIPE_INTENT_RESPONSE = {
    id: 'MOCKED_STRIPE',
    object: 'payment_intent',
    amount: 100,
    amount_capturable: 0,
    amount_details: { tip: {} },
    amount_received: 0,
    application: null,
    application_fee_amount: 2952,
    automatic_payment_methods: null,
    canceled_at: 1652881340,
    cancellation_reason: null,
    capture_method: 'automatic',
    charges: {
        object: 'list',
        data: [],
        has_more: false,
        total_count: 0,
        url: `/v1/charges?payment_intent=${STRIPE_CREDENTIALS.paymentIntentId}`,
    },
    client_secret: `${STRIPE_CREDENTIALS.paymentIntentId}_secret_MOCKED`,
    confirmation_method: 'automatic',
    created: 1652881339,
    currency: 'usd',
    customer: STRIPE_CREDENTIALS.customerId,
    description: null,
    invoice: null,
    last_payment_error: null,
    livemode: false,
    metadata: {
        orderId: '1034',
        storeId: '296',
        customerEmail: 'user-2@gmail.com',
        orderableType: 'ServiceOrder',
        orderableId: '51',
        storeCustomerId: '1644',
    },
    next_action: null,
    on_behalf_of: STRIPE_CREDENTIALS.destinationAccountId,
    payment_method: STRIPE_CREDENTIALS.paymentMethodId,
    payment_method_options: {
        card: {
            installments: null,
            mandate_options: null,
            network: null,
            request_three_d_secure: 'automatic',
        },
    },
    payment_method_types: ['card'],
    processing: null,
    receipt_email: null,
    review: null,
    setup_future_usage: null,
    shipping: null,
    source: null,
    statement_descriptor: null,
    statement_descriptor_suffix: null,
    status: 'canceled',
    total_details: {
        amount_tax: 0,
        amount_tip: null,
    },
    transfer_data: { destination: STRIPE_CREDENTIALS.destinationAccountId },
    transfer_group: null,
};

const STRIPE_PAYMENT_METHOD = {
    id: STRIPE_CREDENTIALS.paymentMethodId,
    object: 'payment_method',
    billing_details: {
        address: {
            city: null,
            country: null,
            line1: null,
            line2: null,
            postal_code: null,
            state: null,
        },
        email: null,
        name: null,
        phone: null,
    },
    card: {
        brand: STRIPE_CREDENTIALS.brand,
        checks: {
            address_line1_check: null,
            address_postal_code_check: null,
            cvc_check: 'unchecked',
        },
        country: 'US',
        exp_month: 8,
        exp_year: 2023,
        fingerprint: STRIPE_CREDENTIALS.fingerPrint,
        funding: 'credit',
        generated_from: null,
        last4: '4242',
        networks: {
            available: [STRIPE_CREDENTIALS.brand],
            preferred: null,
        },
        three_d_secure_usage: {
            supported: true,
        },
        wallet: null,
    },
    created: 1655559477,
    customer: STRIPE_CREDENTIALS.customerId,
    livemode: false,
    metadata: {},
    redaction: null,
    type: 'card',
};

const CREATE_LIVE_LINK_STRIPE_INTENT_RESPONSE = {
    id: 'MOCKED_STRIPE',
    object: 'payment_intent',
    amount: 600,
    amount_capturable: 0,
    amount_details: {
        tip: {},
    },
    amount_received: 600,
    application: null,
    application_fee_amount: 24,
    automatic_payment_methods: null,
    canceled_at: null,
    cancellation_reason: null,
    capture_method: 'automatic',
    charges: {
        object: 'list',
        data: [
            {
                id: STRIPE_CREDENTIALS.chargeId,
                object: 'charge',
                amount: 600,
                amount_captured: 600,
                amount_refunded: 0,
                application: null,
                application_fee: STRIPE_CREDENTIALS.feeName,
                application_fee_amount: 24,
                balance_transaction: STRIPE_CREDENTIALS.balanceTransaction,
                billing_details: {
                    address: {
                        city: null,
                        country: null,
                        line1: null,
                        line2: null,
                        postal_code: null,
                        state: null,
                    },
                    email: null,
                    name: null,
                    phone: null,
                },
                calculated_statement_descriptor: 'TRYCENTS.COM',
                captured: true,
                created: 1655369018,
                currency: 'usd',
                customer: STRIPE_CREDENTIALS.customerId,
                description: null,
                destination: STRIPE_CREDENTIALS.destinationAccountId,
                dispute: null,
                disputed: false,
                failure_balance_transaction: null,
                failure_code: null,
                failure_message: null,
                fraud_details: {},
                invoice: null,
                livemode: false,
                metadata: {
                    storeId: '13',
                    storeCustomerId: '4774',
                    origin: 'LIVE_LINK',
                },
                on_behalf_of: STRIPE_CREDENTIALS.destinationAccountId,
                order: null,
                outcome: {
                    network_status: 'approved_by_network',
                    reason: null,
                    risk_level: 'normal',
                    risk_score: 49,
                    seller_message: 'Payment complete.',
                    type: 'authorized',
                },
                paid: true,
                payment_intent: STRIPE_CREDENTIALS.paymentIntentId,
                payment_method: STRIPE_CREDENTIALS.paymentMethodId,
                payment_method_details: {
                    card: {
                        amount_authorized: 600,
                        brand: 'visa',
                        checks: {
                            address_line1_check: null,
                            address_postal_code_check: null,
                            cvc_check: null,
                        },
                        country: 'US',
                        exp_month: 1,
                        exp_year: 2025,
                        fingerprint: STRIPE_CREDENTIALS.fingerPrint,
                        funding: 'credit',
                        installments: null,
                        last4: '4242',
                        mandate: null,
                        network: 'visa',
                        three_d_secure: null,
                        wallet: null,
                    },
                    type: 'card',
                },
                receipt_email: null,
                receipt_number: null,
                receipt_url: STRIPE_CREDENTIALS.receiptUrl,
                refunded: false,
                refunds: {
                    object: 'list',
                    data: [],
                    has_more: false,
                    total_count: 0,
                    url: `/v1/charges/${STRIPE_CREDENTIALS.chargeId}/refunds`,
                },
                review: null,
                shipping: null,
                source: null,
                source_transfer: null,
                statement_descriptor: null,
                statement_descriptor_suffix: null,
                status: 'succeeded',
                transfer: STRIPE_CREDENTIALS.transferId,
                transfer_data: {
                    amount: null,
                    destination: STRIPE_CREDENTIALS.destinationAccountId,
                },
                transfer_group: `group_${STRIPE_CREDENTIALS.paymentIntentId}`,
            },
        ],
        has_more: false,
        total_count: 1,
        url: `/v1/charges?payment_intent=${STRIPE_CREDENTIALS.paymentIntentId}`,
    },
    client_secret: `${STRIPE_CREDENTIALS.paymentIntentId}_secret_MOCKED`,
    confirmation_method: 'automatic',
    created: 1655369018,
    currency: 'usd',
    customer: STRIPE_CREDENTIALS.customerId,
    description: null,
    invoice: null,
    last_payment_error: null,
    livemode: false,
    metadata: {
        storeId: '13',
        storeCustomerId: '4774',
        origin: 'LIVE_LINK',
        customerEmail: '',
    },
    next_action: null,
    on_behalf_of: STRIPE_CREDENTIALS.destinationAccountId,
    payment_method: STRIPE_CREDENTIALS.paymentMethodId,
    payment_method_options: {
        card: {
            installments: null,
            mandate_options: null,
            network: null,
            request_three_d_secure: 'automatic',
        },
    },
    payment_method_types: ['card'],
    processing: null,
    receipt_email: null,
    review: null,
    setup_future_usage: null,
    shipping: null,
    source: null,
    statement_descriptor: null,
    statement_descriptor_suffix: null,
    status: 'succeeded',
    total_details: {
        amount_tax: 0,
        amount_tip: null,
    },
    transfer_data: {
        destination: STRIPE_CREDENTIALS.destinationAccountId,
    },
    transfer_group: `group_${STRIPE_CREDENTIALS.paymentIntentId}`,
};

const CREATE_STRIPE_REFUND = {
    id: 'MOCKED_STRIPE',
    object: 'refund',
    amount: 100,
    balance_transaction: STRIPE_CREDENTIALS.balanceTransaction,
    charge: STRIPE_CREDENTIALS.charge,
    created: 1655720181,
    currency: 'usd',
    metadata: {},
    payment_intent: CREATE_STRIPE_INTENT_RESPONSE.id,
    reason: 'requested_by_customer',
    receipt_number: null,
    source_transfer_reversal: null,
    status: 'succeeded',
    transfer_reversal: null,
};

const STRIPE_PAYOUT_RESPONSE = {
    id: 'po_mocked',
    object: 'payout',
    amount: 1100,
    arrival_date: 1656288000,
    automatic: true,
    balance_transaction: STRIPE_CREDENTIALS.balanceTransaction,
    created: 1656306308,
    currency: 'usd',
    description: 'STRIPE PAYOUT',
    destination: STRIPE_CREDENTIALS.destinationAccountId,
    failure_balance_transaction: null,
    failure_code: null,
    failure_message: null,
    livemode: false,
    metadata: {},
    method: 'standard',
    original_payout: null,
    reversed_by: null,
    source_type: 'card',
    statement_descriptor: null,
    status: 'in_transit',
    type: 'bank_account',
};

const STRIPE_PAYOUT_BALANCE_TRANSACTION_RESPONSE = {
    id: STRIPE_CREDENTIALS.balanceTransaction,
    object: 'balance_transaction',
    amount: 13013,
    available_on: 1655708400,
    created: 1655708400,
    currency: 'usd',
    description: 'STRIPE PAYOUT',
    exchange_rate: null,
    fee: 0,
    fee_details: [],
    net: 13013,
    reporting_category: 'payout',
    source: 'po_mocked',
    status: 'available',
    type: 'payout',
};

const STRIPE_PAYMENT_BALANCE_TRANSACTION_RESPONSE = {
    id: `${STRIPE_CREDENTIALS.balanceTransaction}_payment`,
    object: 'balance_transaction',
    amount: 13013,
    available_on: 1655708400,
    created: 1655708400,
    currency: 'usd',
    description: 'STRIPE PAYOUT',
    exchange_rate: null,
    fee: 0,
    fee_details: [],
    net: 13013,
    reporting_category: 'payment',
    source: 'po_mocked',
    status: 'available',
    type: 'payment',
};

module.exports = exports = {
    CANCEL_STRIPE_INTENT_RESPONSE,
    CREATE_STRIPE_INTENT_RESPONSE,
    STRIPE_CREDENTIALS,
    CREATE_LIVE_LINK_STRIPE_INTENT_RESPONSE,
    STRIPE_PAYMENT_METHOD,
    CREATE_STRIPE_REFUND,
    STRIPE_PAYOUT_RESPONSE,
    STRIPE_PAYOUT_BALANCE_TRANSACTION_RESPONSE,
    STRIPE_PAYMENT_BALANCE_TRANSACTION_RESPONSE,
};

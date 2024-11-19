require('dotenv').config();
const createIndice = require('../createIndice');
const deleteIndice = require('../deleteIndice');
const checkIndice = require('../checkIndice');
const logger = require('../../lib/logger');

async function businessCustomerSchema() {
    try {
        const indexName = `${process.env.ENV_NAME}_business_customers`;
        const schema = {
            settings: {
                analysis: {
                    analyzer: {
                        custom_analyzer: {
                            tokenizer: 'custom_tokenizer',
                            filter: ['lowercase'],
                        },
                    },
                    tokenizer: {
                        custom_tokenizer: {
                            type: 'ngram',
                            min_gram: 1,
                            max_gram: 2,
                            token_chars: ['letter', 'digit'],
                        },
                    },
                },
            },
            mappings: {
                properties: {
                    id: { type: 'integer' },
                    businessId: { type: 'integer' },
                    storeIds: {
                        type: 'integer',
                    },
                    centsCustomerId: { type: 'integer' },
                    fullName: {
                        type: 'text',
                        fields: {
                            analyzed: {
                                type: 'text',
                                analyzer: 'custom_analyzer',
                            },
                            raw: {
                                type: 'keyword',
                            },
                        },
                    },
                    phoneNumber: {
                        type: 'text',
                        fields: {
                            analyzed: {
                                type: 'text',
                                analyzer: 'custom_analyzer',
                            },
                        },
                    },
                    email: {
                        type: 'text',
                        fields: {
                            analyzed: {
                                type: 'text',
                                analyzer: 'custom_analyzer',
                            },
                        },
                    },
                    isCommercial: { type: 'boolean' },
                    isInvoicingEnabled: { type: 'boolean' },
                    stripeCustomerId: { type: 'keyword' },
                    storeCustomers: {
                        type: 'nested',
                        properties: {
                            id: { type: 'integer' },
                            storeId: { type: 'integer' },
                            availableCredit: { type: 'float' },
                            hangDrySelected: { type: 'boolean' },
                            hangDryInstructions: { type: 'keyword' },
                            languageId: { type: 'integer' },
                            notes: { type: 'keyword' },
                            order: {
                                type: 'object',
                                properties: {
                                    orderCode: { type: 'keyword' },
                                    isActive: { type: 'boolean' },
                                    orderId: { type: 'integer' },
                                    status: { type: 'keyword' },
                                },
                            },
                        },
                    },
                },
            },
        };

        const index = await checkIndice(indexName);
        if (index && index.statusCode === 200) {
            logger.info(`${indexName} index already exists.`);
            logger.info(`deleting ${indexName} index`);
            await deleteIndice(indexName);
            logger.info(`deleted ${indexName} index`);
        }
        await createIndice(indexName, schema);
        logger.info(`${indexName} index created successfully!.`);
    } catch (error) {
        logger.error(error);
    }
}
module.exports = {
    businessCustomerSchema,
};

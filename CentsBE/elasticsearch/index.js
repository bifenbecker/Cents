require('dotenv').config();
const { Client } = require('@elastic/elasticsearch');
const AWS = require('aws-sdk');
const createAwsElasticsearchConnector = require('aws-elasticsearch-connector');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

let awsCredentials = {};
const shouldCreateAwsElasticsearchConnector = ![
    'http://localhost:9200',
    'http://elasticsearch:9200',
].includes(process.env.ELASTICSEARCH_HOST);
if (shouldCreateAwsElasticsearchConnector) {
    const awsConfig = new AWS.Config({
        region: 'us-east-2',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    awsCredentials = createAwsElasticsearchConnector(awsConfig);
}

const client = new Client({
    ...awsCredentials,
    node: process.env.ELASTICSEARCH_HOST,
});
client.on('request', (err, result) => {
    const { id } = result.meta.request;
    if (err) {
        LoggerHandler('error', err, { id });
    }
});

client.on('response', (err, result) => {
    const { id } = result.meta.request;
    if (err) {
        LoggerHandler('error', err, { id });
    }
});

module.exports = exports = client;

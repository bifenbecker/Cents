require('isomorphic-fetch');
const { AWSAppSyncClient, AUTH_TYPE } = require('aws-appsync');
const gql = require('graphql-tag');

async function executeQuery(query, variables = {}) {
    const client = new AWSAppSyncClient({
        url: process.env.APPSYNC_API_URL,
        region: 'us-east-2',
        auth: {
            type: AUTH_TYPE.AWS_IAM,
            credentials: {
                accessKeyId: process.env.APPSYNC_IAM_USER_ACCESS_KEY,
                secretAccessKey: process.env.APPSYNC_IAM_USER_SECRET_KEY,
            },
        },
        disableOffline: true,
    });

    const response = await client.query({
        query: gql(query),
        variables,
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
    });

    return response;
}

// exports object for easy testing stubbing
const graphQLHelper = {
    executeQuery,
};

module.exports = graphQLHelper;

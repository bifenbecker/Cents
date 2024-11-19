const router = require('express').Router();
const handleGraphQLQuery = require('./handleGraphQLQuery');
const graphQLValidation = require('../../../validations/analytics-dashboard/graphQLValidation');

router.post('/graphql', graphQLValidation, handleGraphQLQuery);

module.exports = router;

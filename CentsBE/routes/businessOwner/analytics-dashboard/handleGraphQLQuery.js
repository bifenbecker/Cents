const graphQLHelper = require('./graphQLHelper');

async function handleGraphQLQuery(req, res, next) {
    try {
        const { query, variables } = req.body;

        const response = await graphQLHelper.executeQuery(query, variables);

        return res.status(200).json({
            success: !response.errors?.length,
            data: response.data,
            errors: response.errors,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = handleGraphQLQuery;

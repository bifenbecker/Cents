function returnTermQuery(field, value) {
    return {
        [field]: {
            value,
        },
    };
}

function returnMatchQuery(field, value) {
    return {
        [field]: value,
    };
}

module.exports = exports = { returnTermQuery, returnMatchQuery };

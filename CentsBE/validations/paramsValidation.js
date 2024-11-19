function validateParamsIdType({ params: { id } }) {
    return (
        id !== undefined &&
        id !== 'undefined' &&
        id !== null &&
        id !== 'null' &&
        typeof id !== 'undefined'
    );
}

module.exports = exports = {
    validateParamsIdType,
};

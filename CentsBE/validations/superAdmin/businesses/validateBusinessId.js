function validateRequest(req) {
    const { params } = req;
    const { id } = params;

    if (id === undefined || id === null || typeof id === 'undefined') {
        return false;
    }

    return true;
}

module.exports = exports = validateRequest;

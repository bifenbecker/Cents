function validateRequest(req) {
    const { params } = req;
    const { readerId } = params;

    if (readerId === undefined || readerId === null || typeof readerId === 'undefined') {
        return false;
    }

    return true;
}

module.exports = exports = validateRequest;

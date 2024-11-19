function validateRequest(req) {
    const { params } = req;
    const { servicePriceId } = params;

    if (
        servicePriceId === undefined ||
        servicePriceId === null ||
        typeof servicePriceId === 'undefined'
    ) {
        return false;
    }

    return true;
}

module.exports = exports = validateRequest;

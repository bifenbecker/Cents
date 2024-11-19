function requiresUberAuthToken(payload) {
    try {
        const { orderDelivery } = payload;
        if (orderDelivery.deliveryProvider === 'OWN_DRIVER') {
            return payload;
        }
        const newPayload = payload;
        newPayload.requireUberAuthToken = true;
        return newPayload;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = exports = requiresUberAuthToken;

function stripeErrorMessage(error) {
    let message = '';
    switch (error.type) {
        case 'StripeCardError':
            // A declined card erroror
            message = error.message; // => e.g. "Your card's expiration year is invalid."
            break;
        case 'StripeInvalidRequestError':
            // Invalid parameters were supplied to Stripe's API
            message = "Invalid parameters were supplied to Stripe's API.";
            break;
        case 'StripeAPIError':
            message = "An erroror occurred internally with Stripe's API.";
            break;
        case 'StripeConnectionError':
            message = 'Some kind of erroror occurred during the HTTPS communication.';
            break;
        case 'StripeAuthenticationError':
            message = 'You probably used an incorrect API key.';
            break;
        case 'StripeRateLimitError':
            message = 'Too many requests hit the API too quickly.';
            break;
        case 'StripePermissionError':
            message = 'Access to a resource is not allowed.';
            break;
        case 'StripeIdempotencyError':
            message = 'An idempotency key was used improperly.';
            break;
        case 'StripeInvalidGrantError':
            message = error.message;
            // `InvalidGrantError is raised when a specified code doesn't exist, is
            //  expired, has been used, or doesn't belong to you; a refresh token doesn't
            //  exist, or doesn't belong to you; or if an API key's mode (live or test)
            //  doesn't match the mode of a code or refresh token.`;
            break;
        default:
            message =
                process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong!';
            break;
    }
    return message;
}

module.exports = exports = stripeErrorMessage;
